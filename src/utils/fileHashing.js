import { supabase } from "../config/supabaseClient";

/**
 * Generate a SHA-256 hash of a file
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - The hex-encoded hash
 */
export const generateFileHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Check if a file hash already exists in the database (duplicate check)
 * @param {string} fileHash - The hash to check
 * @returns {Promise<boolean>} - True if duplicate exists
 */
export const checkDuplicateHash = async (fileHash) => {
  try {
    const { data, error } = await supabase
      .from("proofs")
      .select("id")
      .eq("file_hash", fileHash)
      .limit(1);

    if (error) {
      console.error("Error checking duplicate:", error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Duplicate check error:", error);
    return false;
  }
};
