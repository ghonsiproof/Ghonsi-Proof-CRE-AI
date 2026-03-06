import { cre, Runner, type Runtime, type HTTPPayload, decodeJson } from "@chainlink/cre-sdk";
import { z } from "zod";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// --- Configuration Schema ---
const configSchema = z.object({
  anthropicApiKey: z.string(),
  pinataJwt: z.string(),
  supabaseUrl: z.string(),
  supabaseServiceKey: z.string(),
});

type Config = z.infer<typeof configSchema>;

// --- Proof Status Enums ---
const ProofStatus = {
  AI_PROCESSING: "AI_PROCESSING",
  AI_APPROVED: "AI_APPROVED",
  AI_REJECTED: "AI_REJECTED",
  CHAIN_PENDING: "CHAIN_PENDING",
  VERIFIED: "VERIFIED",
} as const;

// --- Failure Reason Codes ---
const FailureReason = {
  NO_EXTRACTED_DATA: "NO_EXTRACTED_DATA",
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  DUPLICATE_DOCUMENT: "DUPLICATE_DOCUMENT",
  INVALID_FORMAT: "INVALID_FORMAT",
} as const;

// --- Request/Response Types ---
interface ProofRequest {
  proofId: string;
  fileUrl: string;
  proofType: string;
  proofName: string;
  signature: string;
}

interface AIResult {
  aiData: any;
  confidence: number;
  extractedData: any;
}

interface PinataResult {
  ipfsHash: string;
}

// --- Helper Functions ---

/**
 * Determine failure reason based on AI result
 */
function determineFailureReason(aiResult: AIResult): string | null {
  if (!aiResult.extractedData || Object.keys(aiResult.extractedData).length === 0) {
    return FailureReason.NO_EXTRACTED_DATA;
  }
  if (aiResult.confidence < 85) {
    return FailureReason.LOW_CONFIDENCE;
  }
  return null;
}

/**
 * Call Claude AI API to extract data from document
 */
async function callClaudeAI(config: Config, request: ProofRequest): Promise<AIResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": config.anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `You are a document verifier for a professional proof system. 
Extract structured data from this ${request.proofType} document at URL: ${request.fileUrl}.
Return JSON with relevant fields and a confidence score 0-100 indicating how clearly 
this document proves the claimed achievement. 
Proof name: "${request.proofName}".`
      }]
    })
  });

  if (!response.ok) {
    // Return simulated result if API fails
    return {
      aiData: { error: "API call failed", simulated: true },
      confidence: 0,
      extractedData: null
    };
  }

  const data = await response.json();
  
  // Try to extract confidence from response
  let confidence = 0;
  let extractedData = null;
  
  try {
    const content = data.content?.[0]?.text || "";
    
    // Try to extract confidence
    const confidenceMatch = content.match(/confidence[:\s]+(\d+)/i);
    if (confidenceMatch) {
      confidence = parseInt(confidenceMatch[1], 10);
    }
    
    // Try to extract JSON data from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        extractedData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Failed to parse JSON
      }
    }
  } catch (e) {
    // Use default values
  }

  return {
    aiData: data,
    confidence,
    extractedData
  };
}

/**
 * Upload verified metadata to Pinata IPFS
 */
async function uploadToPinata(runtime: Runtime<Config>, config: Config, request: ProofRequest, aiResult: AIResult): Promise<PinataResult | null> {
  // DECISION LOGIC: Only upload to Pinata if AI approved
  if (aiResult.confidence < 85) {
    runtime.log("Confidence below threshold, skipping Pinata upload");
    return null;
  }

  // Validate Pinata JWT is configured
  if (!config.pinataJwt || config.pinataJwt.trim() === "") {
    runtime.log("ERROR: Pinata JWT is not configured. Please set PINATA_JWT in your environment variables.");
    return null;
  }

  runtime.log("Uploading to Pinata IPFS...");

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.pinataJwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pinataContent: {
          proofName: request.proofName,
          walletSignature: request.signature,
          aiVerification: aiResult.aiData,
          timestamp: new Date().toISOString()
        },
        pinataMetadata: { name: `${request.proofName}-verification.json` }
      })
    });

    // Log response status for debugging
    runtime.log(`Pinata response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      runtime.log(`ERROR: Pinata upload failed with status ${response.status}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.IpfsHash) {
      runtime.log("ERROR: Pinata response missing IpfsHash");
      return null;
    }

    runtime.log(`Successfully uploaded to Pinata. IPFS Hash: ${data.IpfsHash}`);
    return { ipfsHash: data.IpfsHash };
  } catch (error) {
    runtime.log(`ERROR: Exception during Pinata upload: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Update Supabase database with verification results
 * Uses explicit lifecycle states:
 * - AI_APPROVED: AI verified the document with confidence >= 85
 * - AI_REJECTED: AI rejected due to low confidence or other issues
 */
async function updateSupabase(
  config: Config, 
  request: ProofRequest, 
  aiResult: AIResult, 
  pinataResult: PinataResult | null
): Promise<{ success: boolean; status: string; failure_reason: string | null }> {
  // Determine final status based on confidence
  const isApproved = aiResult.confidence >= 85;
  const finalStatus = isApproved ? ProofStatus.AI_APPROVED : ProofStatus.AI_REJECTED;
  const failureReason = determineFailureReason(aiResult);
  
  const ipfsLink = pinataResult?.ipfsHash ? `ipfs://${pinataResult.ipfsHash}` : null;

  // Prepare update payload
  const updatePayload: any = {
    status: finalStatus,
    ai_confidence_score: aiResult.confidence,
    metadata_ipfs_url: ipfsLink,
  };

  // Add failure reason if rejected
  if (failureReason) {
    updatePayload.failure_reason = failureReason;
  }

  // Add extracted data if available
  if (aiResult.extractedData) {
    updatePayload.extracted_data = aiResult.extractedData;
  }

  const response = await fetch(`${config.supabaseUrl}/rest/v1/proofs?id=eq.${request.proofId}`, {
    method: "PATCH",
    headers: {
      "apikey": config.supabaseServiceKey,
      "Authorization": `Bearer ${config.supabaseServiceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(updatePayload)
  });

  return { 
    success: response.ok, 
    status: finalStatus,
    failure_reason: failureReason
  };
}

// --- Main Workflow Handler ---

/**
 * The HTTP trigger handler - receives requests from the frontend
 */
const onHttpTrigger = async (runtime: Runtime<Config>, payload: HTTPPayload): Promise<string> => {
  runtime.log("Processing new proof verification request");

  // Parse the request body - payload.input contains the request body as bytes
  if (!payload.input || payload.input.length === 0) {
    runtime.log("HTTP trigger payload is empty");
    throw new Error("Request body is empty");
  }

  // Convert bytes to string and parse JSON
  const requestBody = decodeJson(payload.input) as ProofRequest;
  
  runtime.log(`Received request for proof: ${requestBody.proofName}`);
  runtime.log(`Proof type: ${requestBody.proofType}`);

  // Get configuration from runtime
  const config = runtime.config;

  // --- Step 1: Set status to AI_PROCESSING ---
  runtime.log("Step 1: Setting status to AI_PROCESSING...");
  await fetch(`${config.supabaseUrl}/rest/v1/proofs?id=eq.${requestBody.proofId}`, {
    method: "PATCH",
    headers: {
      "apikey": config.supabaseServiceKey,
      "Authorization": `Bearer ${config.supabaseServiceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify({
      status: ProofStatus.AI_PROCESSING
    })
  });

  // --- Step 2: AI Extraction ---
  runtime.log("Step 2: Calling Claude AI for document extraction...");
  const aiResult = await callClaudeAI(config, requestBody);
  runtime.log(`AI Extraction complete. Confidence: ${aiResult.confidence}%`);

  // --- Step 3: Autonomous Decision & Pinata Upload ---
  runtime.log("Step 3: Evaluating AI confidence and uploading to IPFS...");
  let pinataResult: PinataResult | null = null;
  
  if (aiResult.confidence >= 85) {
    pinataResult = await uploadToPinata(runtime, config, requestBody, aiResult);
    if (pinataResult) {
      runtime.log(`Uploaded to IPFS. Hash: ${pinataResult.ipfsHash}`);
    } else {
      runtime.log("IPFS upload failed or was skipped");
    }
  } else {
    runtime.log(`Confidence too low (${aiResult.confidence}%). Skipping IPFS upload.`);
  }

  // --- Step 4: Update Supabase Database with final status ---
  runtime.log("Step 4: Updating portfolio database with AI decision...");
  const dbResult = await updateSupabase(config, requestBody, aiResult, pinataResult);
  runtime.log(`Database updated. Status: ${dbResult.status}, Failure Reason: ${dbResult.failure_reason}`);

  // Return the result
  const result = {
    success: true,
    proofId: requestBody.proofId,
    aiConfidence: aiResult.confidence,
    status: dbResult.status,
    failure_reason: dbResult.failure_reason,
    ipfsHash: pinataResult?.ipfsHash || null
  };

  return JSON.stringify(result, null, 2);
};

// --- Workflow Initialization ---

const initWorkflow = (config: Config) => {
  const httpCapability = new cre.capabilities.HTTPCapability();

  return [
    cre.handler(
      httpCapability.trigger({}),
      onHttpTrigger
    ),
  ];
};

// --- Main Entry Point ---

export async function main() {
  const runner = await Runner.newRunner<Config>({ configSchema });
  await runner.run(initWorkflow);
}

main();
