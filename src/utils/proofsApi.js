import {
  supabase,
  PROOF_FILES_BUCKET,
  getPublicUrl,
} from "../config/supabaseClient";

/**
 * Proof Management API
 */

// Upload a proof with files
export const uploadProof = async (
  proofData,
  referenceFiles = [],
  supportingFiles = []
) => {
  try {
    // FIX: app uses wallet-based auth, not Supabase auth session.
    // userId is passed directly in proofData from upload.jsx
    const userId = proofData.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // 1. Insert proof record with IPFS and transaction data
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .insert({
        user_id: userId,
        proof_type: proofData.proofType,
        proof_name: proofData.proofName,
        summary: proofData.summary,
        reference_link: proofData.referenceLink || null,
        file_ipfs_hash: proofData.fileIpfsHash || proofData.ipfsHash || null,
        file_ipfs_url: proofData.fileIpfsUrl || proofData.ipfsUrl || null,
        metadata_ipfs_hash: proofData.metadataIpfsHash || null,
        metadata_ipfs_url: proofData.metadataIpfsUrl || null,
        blockchain_tx: proofData.blockchain_tx || proofData.transactionHash || null,
        file_hash: proofData.fileHash || null,
        status: proofData.status || "pending",
        verified_at: proofData.status ? null : new Date().toISOString(),
        extracted_data: proofData.extractedData || null,
      })
      .select()
      .single();

    if (proofError) throw proofError;

    // 2. Upload reference files
    const referenceFileRecords = await uploadFiles(
      proof.id,
      referenceFiles,
      "reference",
      userId
    );

    // 3. Upload supporting files
    const supportingFileRecords = await uploadFiles(
      proof.id,
      supportingFiles,
      "supporting",
      userId
    );

    return {
      proof,
      referenceFiles: referenceFileRecords,
      supportingFiles: supportingFileRecords,
    };
  } catch (error) {
    console.error("Upload proof error:", error);
    console.error("Upload proof error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

// Helper function to upload files to Supabase Storage
const uploadFiles = async (proofId, files, fileType, userId) => {
  const uploadedFiles = [];

  for (const file of files) {
    try {
      const timestamp = Date.now();
      const filename = `${userId}/${proofId}/${timestamp}-${file.name}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from(PROOF_FILES_BUCKET)
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) throw storageError;

      const fileUrl = getPublicUrl(PROOF_FILES_BUCKET, storageData.path);

      const { data: fileRecord, error: fileError } = await supabase
        .from("files")
        .insert({
          proof_id: proofId,
          file_type: fileType,
          filename: file.name,
          file_url: fileUrl,
          file_path: storageData.path,
          mime_type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (fileError) throw fileError;

      uploadedFiles.push(fileRecord);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
    }
  }

  return uploadedFiles;
};

// Get all proofs for a user
export const getUserProofs = async (userId) => {
  const { data, error } = await supabase
    .from("proofs")
    .select(`*, files(*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Get a single proof by ID
export const getProof = async (proofId) => {
  const { data, error } = await supabase
    .from("proofs")
    .select(`*, files(*), users(wallet_address, email)`)
    .eq("id", proofId)
    .single();

  if (error) throw error;
  return data;
};

// Update proof
export const updateProof = async (proofId, updates) => {
  const { data, error } = await supabase
    .from("proofs")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proofId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete proof
export const deleteProof = async (proofId) => {
  const { data: files, error: filesError } = await supabase
    .from("files")
    .select("file_path")
    .eq("proof_id", proofId);

  if (filesError) throw filesError;

  if (files && files.length > 0) {
    const filePaths = files.map((f) => f.file_path);
    const { error: storageError } = await supabase.storage
      .from(PROOF_FILES_BUCKET)
      .remove(filePaths);

    if (storageError)
      console.error("Error deleting files from storage:", storageError);
  }

  const { error: deleteFilesError } = await supabase
    .from("files")
    .delete()
    .eq("proof_id", proofId);

  if (deleteFilesError) throw deleteFilesError;

  const { error: deleteProofError } = await supabase
    .from("proofs")
    .delete()
    .eq("id", proofId);

  if (deleteProofError) throw deleteProofError;

  return true;
};

// Update proof status (for admin/verification)
export const updateProofStatus = async (proofId, status, verifierId = null) => {
  const updates = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "verified") {
    updates.verified_at = new Date().toISOString();
    if (verifierId) updates.verifier_id = verifierId;
  }

  const { data, error } = await supabase
    .from("proofs")
    .update(updates)
    .eq("id", proofId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const profileWithfileProofs = async () => {
  const { data: profile, error } = await supabase
    .from("profiles_with_proofs_files")
    .select(`*, users(wallet_address)`);
  if (error) throw error;
  return profile;
};

// Get proof statistics for a user
export const getProofStats = async (userId) => {
  const { data, error } = await supabase
    .from("proofs")
    .select("status, proof_type")
    .eq("user_id", userId);

  if (error) throw error;

  const stats = {
    total: data.length,
    verified: data.filter((p) => p.status === "verified").length,
    pending: data.filter((p) => p.status === "pending").length,
    rejected: data.filter((p) => p.status === "rejected").length,
    byType: {},
  };

  data.forEach((proof) => {
    if (!stats.byType[proof.proof_type]) {
      stats.byType[proof.proof_type] = 0;
    }
    stats.byType[proof.proof_type]++;
  });

  return stats;
};

// Get system-wide proof statistics for the Admin Dashboard
export const getGlobalProofStats = async () => {
  try {
    const [totalResult, verifiedResult] = await Promise.all([
      supabase.from('proofs').select('*', { count: 'exact', head: true }),
      supabase.from('proofs').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    ]);

    if (totalResult.error) throw totalResult.error;
    if (verifiedResult.error) throw verifiedResult.error;

    return {
      total: totalResult.count || 0,
      verified: verifiedResult.count || 0,
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    throw error;
  }
};
