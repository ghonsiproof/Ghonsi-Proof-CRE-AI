/**
 * LOCAL CRE WORKFLOW SIMULATOR
 * Run this with: node simulate.js
 * 
 * IMPORTANT: Keys are loaded from .env file - never hardcode keys here!
 */

require('dotenv').config();

// Load keys from environment variables
const KEYS = {
  ANTHROPIC: process.env.ANTHROPIC_API_KEY || "",
  PINATA_JWT: process.env.PINATA_JWT || "",
  SUPABASE_URL: process.env.SUPABASE_URL || "https://jzcowmijfzsgehyscfaw.supabase.co",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ""
};

// Validation: Check if required keys are present
const missingKeys = [];
if (!KEYS.PINATA_JWT || KEYS.PINATA_JWT === "" || KEYS.PINATA_JWT === "your_pinata_jwt_token_here") {
  missingKeys.push("PINATA_JWT");
}
if (!KEYS.ANTHROPIC || KEYS.ANTHROPIC === "") {
  missingKeys.push("ANTHROPIC_API_KEY");
}
if (!KEYS.SUPABASE_SERVICE_KEY || KEYS.SUPABASE_SERVICE_KEY === "") {
  missingKeys.push("SUPABASE_SERVICE_ROLE_KEY");
}

if (missingKeys.length > 0) {
  console.log("❌ ERROR: Missing required environment variables:");
  console.log(`   Missing: ${missingKeys.join(", ")}`);
  console.log("\n📝 Please create a .env file in the cre-agent directory with:");
  console.log("   ANTHROPIC_API_KEY=your_key_here");
  console.log("   PINATA_JWT=your_pinata_jwt_here");
  console.log("   SUPABASE_SERVICE_ROLE_KEY=your_key_here");
  console.log("\n💡 Copy .env.example to .env and fill in your values.");
  console.log("   Get PINATA JWT: https://app.pinata.cloud/");
  process.exit(1);
}

console.log("✅ All required API keys loaded successfully!");

// 1. The Mock Trigger Data (What the frontend sends)
const mockRequest = {
  proofId: "0ab02f06-2fdc-4c7d-9457-f4f5e8373b39", // This should match an actual proof ID in your Supabase DB for testing
  fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testTitle.pdf", // Can be a real image URL from your bucket
  proofType: "certificates",
  proofName: "Hackathon Test Certificate",
  summary: "Testing the autonomous agent.",
  signature: "mock-solana-signature-12345"
};

async function simulateWorkflow() {
  console.log("========================================");
  console.log("🤖 STARTING CRE AGENT SIMULATION");
  console.log("========================================\n");

  try {
    // --- STEP 1: AI EXTRACTION ---
    console.log("[Step 1] 🧠 Triggering Claude AI Extractor...");

    // Add timeout handling to prevent ETIMEDOUT errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    // In a real scenario, you'd use the Claude API. We are simulating the network request here.
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": KEYS.ANTHROPIC,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `You are a strict data extractor. Extract JSON data for a ${mockRequest.proofType} from this document URL: ${mockRequest.fileUrl}. Just return a JSON object with a confidence score 0-100.`
        }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!claudeResponse.ok) {
      console.log("⚠️ Claude API Error (Check your API Key). Simulating success for testing...");
    }

    // Mocking the AI response for the sake of the simulator flowing
    const aiResult = {
      confidence: 92, // High confidence!
      extractedData: { title: mockRequest.proofName, verified: true }
    };

    console.log(`✅ AI Extraction Complete! Confidence Score: ${aiResult.confidence}%\n`);

    // --- STEP 2: AUTONOMOUS DECISION & PINATA ---
    console.log("[Step 2] 📦 Evaluating AI Confidence for On-Chain Storage...");

    // DEBUG: Check if PINATA_JWT is loading from .env
    console.log(process.env.PINATA_JWT);

    let ipfsHash = null;
    if (aiResult.confidence >= 85) {
      console.log("🟢 Confidence is high (>85%). Uploading immutable record to Pinata IPFS...");

      // Add timeout handling for Pinata request
      const pinataController = new AbortController();
      const pinataTimeoutId = setTimeout(() => pinataController.abort(), 30000); // 30 second timeout

      const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${KEYS.PINATA_JWT}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pinataContent: {
            proofName: mockRequest.proofName,
            walletSignature: mockRequest.signature,
            aiVerification: aiResult.extractedData,
            timestamp: new Date().toISOString()
          },
          pinataMetadata: { name: `${mockRequest.proofName.replace(/\s+/g, '-')}-verification.json` }
        }),
        signal: pinataController.signal
      });

      clearTimeout(pinataTimeoutId);

      if (pinataResponse.ok) {
        const pinataData = await pinataResponse.json();
        ipfsHash = pinataData.IpfsHash;
        console.log(`✅ Uploaded to IPFS successfully! Hash: ${ipfsHash}\n`);
      } else {
        const errorText = await pinataResponse.text();
        console.log(`⚠️ Pinata Error: Status ${pinataResponse.status}`);
        console.log(`   Error details: ${errorText}`);
        console.log("   Please check your PINATA_JWT in .env file.\n");
      }
    } else {
      console.log("🟡 Confidence is low (<85%). Skipping IPFS upload. Flagging for manual review.\n");
    }

    // --- STEP 3: UPDATE SUPABASE ---
    console.log("[Step 3] 🗄️ Updating Portfolio Database...");
    const finalStatus = aiResult.confidence >= 85 ? "verified" : "pending";
    const ipfsLink = ipfsHash ? `ipfs://${ipfsHash}` : null;

    // Add timeout handling for Supabase request
    const supabaseController = new AbortController();
    const supabaseTimeoutId = setTimeout(() => supabaseController.abort(), 30000); // 30 second timeout

    const supabaseResponse = await fetch(`${KEYS.SUPABASE_URL}/rest/v1/proofs?id=eq.${mockRequest.proofId}`, {
      method: "PATCH",
      headers: {
        "apikey": KEYS.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${KEYS.SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        status: finalStatus,
        blockchain_tx: mockRequest.signature, // The wallet signature
        // pinata_url: ipfsLink // Uncomment if you have this column in your DB!
      }),
      signal: supabaseController.signal
    });

    clearTimeout(supabaseTimeoutId);

    if (supabaseResponse.ok) {
      console.log(`✅ Database updated! Proof status changed to: [${finalStatus.toUpperCase()}]\n`);
    } else {
      const err = await supabaseResponse.text();
      console.log(`❌ Supabase Error (Check your Keys or Proof ID): ${err}\n`);
    }

    console.log("========================================");
    console.log("🎉 WORKFLOW SIMULATION COMPLETE");
    console.log("========================================");

  } catch (error) {
    console.error("Workflow failed:", error);
  }
}

simulateWorkflow();