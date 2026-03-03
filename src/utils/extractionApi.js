/**
 * Extraction API Integration
 * Handles communication with the document extraction service
 */

const API_URL = 'https://extraction-api-e54a.onrender.com/api/extract/'; // FIX: full URL so this works in production on Vercel

/**
 * Map UI proof types to API proof types
 */
export const proofTypeMapping = {
  'certificates': 'certificate',
  'job_history': 'job',
  'skills': 'skill',
  'milestones': 'milestone',
  'community_contributions': 'contribution',
};

/**
 * Check if a proof type supports extraction
 */
export const supportsExtraction = (proofType) => {
  return proofType in proofTypeMapping;
};

/**
 * Derive normalizedSkills from extracted data based on proof type.
 * Always returns an array, max 2 items, confidence filtered, field-agnostic.
 */
const deriveNormalizedSkills = (proofType, extractedData) => {
  if (!extractedData) return [];
  
  const confidence = extractedData.confidence || {};
  const skills = [];

  switch (proofType) {
    case 'certificate': {
      // If program_category exists and confidence.program_category >= 0.7
      const programCategory = extractedData.program_category;
      const programCategoryConfidence = confidence.program_category;
      if (programCategory && typeof programCategory === 'string' && 
          programCategoryConfidence >= 0.7) {
        skills.push(programCategory);
      }
      break;
    }

    case 'job': {
      // If job_category exists and confidence.job_category >= 0.7
      const jobCategory = extractedData.job_category;
      const jobCategoryConfidence = confidence.job_category;
      if (jobCategory && typeof jobCategory === 'string' && 
          jobCategoryConfidence >= 0.7) {
        skills.push(jobCategory);
      }
      break;
    }

    case 'skill': {
      // If extractedData.skills exists and is array, filter by confidence if available, slice first 2
      const extractedSkills = extractedData.skills;
      if (Array.isArray(extractedSkills)) {
        const filteredSkills = extractedSkills.filter(skill => {
          // If confidence object exists with skill names as keys
          if (confidence && typeof confidence === 'object') {
            // skill could be a string or object with name property
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const skillConfidence = confidence[skillName];
            // If confidence is available, check threshold; if not, include skill
            if (skillConfidence !== undefined) {
              return skillConfidence >= 0.7;
            }
          }
          return true; // Include if no confidence data
        });
        skills.push(...filteredSkills.slice(0, 2));
      } else if (extractedData.skill_name) {
        // Fallback to single skill_name
        const skillNameConfidence = confidence.skill_name;
        if (skillNameConfidence === undefined || skillNameConfidence >= 0.7) {
          skills.push(extractedData.skill_name);
        }
      }
      break;
    }

    case 'milestone': {
      // Only include if there is a category style field with confidence >= 0.7
      const milestoneType = extractedData.milestone_type;
      const milestoneTypeConfidence = confidence.milestone_type;
      if (milestoneType && typeof milestoneType === 'string' && 
          milestoneTypeConfidence >= 0.7) {
        skills.push(milestoneType);
      }
      break;
    }

    case 'contribution': {
      // Only include if there is a category style field with confidence >= 0.7
      const contributionType = extractedData.contribution_type;
      const contributionTypeConfidence = confidence.contribution_type;
      if (contributionType && typeof contributionType === 'string' && 
          contributionTypeConfidence >= 0.7) {
        skills.push(contributionType);
      }
      break;
    }

    default:
      break;
  }

  // Enforce: Array, Max 2, Remove nulls/undefined
  return [...skills]
    .filter(s => s && typeof s === 'string' && s.trim().length > 0)
    .slice(0, 2);
};

/**
 * Normalize the extracted_data fields into a consistent shape that
 * upload.jsx can use regardless of proof type.
 *
 * Always returns: { title, summary, raw, normalizedSkills }
 *   title   → used to pre-fill the "Proof Name" input
 *   summary → used to pre-fill the "Summary" textarea
 *   raw     → the full extracted_data object, stored as extractedData in the DB
 *   normalizedSkills → standardized skills array (max 2 items, confidence filtered)
 */
const normalizeExtractedData = (proofType, extractedData) => {
  if (!extractedData) {
    return { title: null, summary: null, raw: null, normalizedSkills: [] };
  }

  const normalizedSkills = deriveNormalizedSkills(proofType, extractedData);

  switch (proofType) {
    case 'certificate': {
      const title = extractedData.certificate_title || null;
      const parts = [
        extractedData.issuer && `Issuer: ${extractedData.issuer}`,
        extractedData.credential_type && `Type: ${extractedData.credential_type}`,
        extractedData.program_category && `Category: ${extractedData.program_category}`,
        extractedData.completion_date && `Completed: ${extractedData.completion_date}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData, normalizedSkills };
    }

    case 'job': {
      const title = extractedData.job_title
        ? `${extractedData.job_title}${extractedData.company ? ` at ${extractedData.company}` : ''}`
        : null;
      const parts = [
        extractedData.employment_type && `Type: ${extractedData.employment_type}`,
        extractedData.date_range && `Period: ${extractedData.date_range}`,
        extractedData.location && `Location: ${extractedData.location}`,
        extractedData.job_category && `Category: ${extractedData.job_category}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData, normalizedSkills };
    }

    case 'skill': {
      const skills = extractedData.skills;
      const skillList = Array.isArray(skills) && skills.length > 0
        ? skills.join(', ')
        : extractedData.skill_name || null;
      const title = skillList ? `Skills: ${skillList}` : null;
      const parts = [
        extractedData.skill_category && `Category: ${extractedData.skill_category}`,
        extractedData.proficiency_level && `Level: ${extractedData.proficiency_level}`,
        extractedData.evidence_type && `Evidence: ${extractedData.evidence_type}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData, normalizedSkills };
    }

    case 'milestone': {
      const title = extractedData.milestone_type
        ? `${extractedData.milestone_type}${extractedData.issuer ? ` from ${extractedData.issuer}` : ''}`
        : null;
      const summary = extractedData.milestone_summary || null;
      return { title, summary, raw: extractedData, normalizedSkills };
    }

    case 'contribution': {
      const title = extractedData.title || extractedData.contribution_type || null;
      const parts = [
        extractedData.platform_name && `Platform: ${extractedData.platform_name}`,
        extractedData.date && `Date: ${extractedData.date}`,
        extractedData.url && `URL: ${extractedData.url}`,
      ].filter(Boolean);
      return { title, summary: parts.join(', ') || null, raw: extractedData, normalizedSkills };
    }

    default:
      return { title: null, summary: null, raw: extractedData, normalizedSkills };
  }
};

/**
 * Extract data from a document using the extraction API.
 *
 * Returns a normalized object: { title, summary, raw, needsReview, flaggedFields, validationHash }
 * or null if extraction fails.
 */
export const extractDocumentData = async (file, proofType) => {
  if (!supportsExtraction(proofType)) {
    console.log(`Extraction not supported for proof type: ${proofType}`);
    return null;
  }

  const apiProofType = proofTypeMapping[proofType];

  const formData = new FormData();
  formData.append('file', file);
  formData.append('proof_type', apiProofType);

  // Abort after 60 seconds — Render cold start + OCR + LLM can easily cross 40s
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(API_URL, {
method: 'POST',
body: formData,
signal: controller.signal,
});

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Extraction failed with status ${response.status}`
      );
    }

    // API envelope: { proof_type, extracted_data, needs_review, flagged_fields, validation_hash, cached }
    const envelope = await response.json();
    const normalized = normalizeExtractedData(apiProofType, envelope.extracted_data);

    return {
      ...normalized,                          // title, summary, raw
      needsReview: envelope.needs_review,
      flaggedFields: envelope.flagged_fields,
      validationHash: envelope.validation_hash,
      cached: envelope.cached,
    };    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Extraction request timed out');
      // Return null instead of throwing to allow proof creation to continue without extracted data
      return null;
    }
    console.error('Extraction error:', error);
    throw error;
  }
};

/**
 * Get the API proof type from UI proof type
 */
export const getApiProofType = (proofType) => {
  return proofTypeMapping[proofType] || proofType;
};