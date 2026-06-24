/**
 * Embedding Service
 * -----------------
 * Responsible for generating, storing, and managing vector embeddings
 * for both job descriptions and candidate profiles.
 *
 * Provider:  HuggingFace Inference API (free tier)
 * Model:     BAAI/bge-small-en-v1.5 (384 dimensions)
 * Storage:   Supabase Pgvector columns
 *
 * Architecture Notes:
 * - This service is a pure data/AI service — no HTTP or Express logic.
 * - It uses content hashing to avoid regenerating embeddings for unchanged text.
 * - All database writes use the admin client (service role) to bypass RLS.
 */

const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { pipeline } = require('@xenova/transformers');

// ─── Configuration ───────────────────────────────────────────────
const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5';
const HF_TOKEN = process.env.HF_API_TOKEN;
const EMBEDDING_DIMENSIONS = 384;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const MAX_INPUT_CHARS = 2000; // bge-small-en-v1.5 has 512 token limit; ~2000 chars is safe

let extractor = null;

class EmbeddingService {

  // ═══════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  /**
   * Pre-warm the embedding model by loading it into RAM on server startup.
   */
  static async initialize() {
    if (!extractor) {
      console.log("[EmbeddingService] Pre-warming local embedding pipeline (Xenova/bge-small-en-v1.5)...");
      try {
        extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
        console.log("[EmbeddingService] Pipeline pre-warmed successfully. AI is ready.");
      } catch (e) {
        console.error("[EmbeddingService] Failed to pre-warm pipeline:", e);
      }
    }
  }

  /**
   * Generate and store an embedding for a job description.
   * Skips regeneration if the description text hasn't changed.
   *
   * @param {string} jobId       - UUID of the job
   * @param {string} description - Raw job description text
   * @returns {Object} { embedding, cached, hash }
   */
  static async generateJobEmbedding(jobId, description) {
    if (!description || description.trim().length === 0) {
      throw new Error('Job description is empty — cannot generate embedding.');
    }

    // Normalize and hash the input text
    const normalizedText = this._normalizeText(description);
    const textHash = this._hashText(normalizedText);

    // Check if embedding already exists with same content hash (skip regeneration)
    const existing = await this._getExistingJobHash(jobId);
    if (existing && existing.embedding_text_hash === textHash) {
      console.log(`[EmbeddingService] Job ${jobId}: content unchanged — using cached embedding.`);
      return { embedding: null, cached: true, hash: textHash };
    }

    // Generate the embedding vector via HuggingFace API
    const embedding = await this._generateEmbedding(normalizedText);

    // Store embedding + hash in the jobs table
    await this._storeJobEmbedding(jobId, embedding, textHash);

    console.log(`[EmbeddingService] Job ${jobId}: new embedding generated and stored.`);
    return { embedding, cached: false, hash: textHash };
  }

  /**
   * Generate and store an embedding for a candidate's profile/CV.
   * Skips regeneration if the profile text hasn't changed.
   *
   * @param {string} candidateId - UUID of the candidate (from candidates table)
   * @param {string} profileText - Combined CV/profile text (skills + education + experience)
   * @returns {Object} { embedding, cached, hash }
   */
  static async generateProfileEmbedding(candidateId, profileText) {
    if (!profileText || profileText.trim().length === 0) {
      throw new Error('Profile text is empty — cannot generate embedding.');
    }

    // Normalize and hash the input text
    const normalizedText = this._normalizeText(profileText);
    const textHash = this._hashText(normalizedText);

    // Check if embedding already exists with same content hash
    const existing = await this._getExistingProfileHash(candidateId);
    if (existing && existing.embedding_text_hash === textHash) {
      console.log(`[EmbeddingService] Candidate ${candidateId}: content unchanged — using cached embedding.`);
      return { embedding: null, cached: true, hash: textHash };
    }

    // Generate the embedding vector via HuggingFace API
    const embedding = await this._generateEmbedding(normalizedText);

    // Store embedding + hash in the resume_parse_data table
    await this._storeProfileEmbedding(candidateId, embedding, textHash);

    console.log(`[EmbeddingService] Candidate ${candidateId}: new embedding generated and stored.`);
    return { embedding, cached: false, hash: textHash };
  }

  /**
   * Build a combined profile text from resume_parse_data fields.
   * This creates a unified string optimized for embedding quality.
   *
   * @param {Object} parseData - Row from resume_parse_data table
   * @returns {string} Combined, embedding-optimized text
   */
  static buildProfileText(parseData) {
    const parts = [];

    if (parseData.skills) {
      parts.push(`Skills: ${parseData.skills}`);
    }
    if (parseData.education) {
      parts.push(`Education: ${parseData.education}`);
    }
    if (parseData.experience_years != null) {
      parts.push(`Experience: ${parseData.experience_years} years`);
    }

    return parts.join('. ');
  }

  /**
   * Build a combined job text from job fields.
   * Creates a unified string optimized for embedding quality.
   *
   * @param {Object} jobData - Row from jobs table
   * @returns {string} Combined, embedding-optimized text
   */
  static buildJobText(jobData) {
    const parts = [];

    if (jobData.title) {
      parts.push(`Job Title: ${jobData.title}`);
    }
    if (jobData.description) {
      parts.push(`Description: ${jobData.description}`);
    }
    if (jobData.required_skill) {
      parts.push(`Required Skills: ${jobData.required_skill}`);
    }
    if (jobData.qualification) {
      parts.push(`Qualification: ${jobData.qualification}`);
    }
    if (jobData.experience_level) {
      parts.push(`Experience Level: ${jobData.experience_level}`);
    }
    if (jobData.location) {
      parts.push(`Location: ${jobData.location}`);
    }

    return parts.join('. ');
  }

  /**
   * Check if both a job and candidate have valid embeddings stored.
   *
   * @param {string} jobId       - UUID of the job
   * @param {string} candidateId - UUID of the candidate
   * @returns {Object} { jobHasEmbedding: boolean, profileHasEmbedding: boolean }
   */
  static async checkEmbeddingsExist(jobId, candidateId) {
    const [jobResult, profileResult] = await Promise.all([
      supabaseAdmin
        .from('jobs')
        .select('job_embedding')
        .eq('job_id', jobId)
        .single(),
      supabaseAdmin
        .from('resume_parse_data')
        .select('profile_embedding')
        .eq('candidate_id', candidateId)
        .single()
    ]);

    return {
      jobHasEmbedding: !!(jobResult.data && jobResult.data.job_embedding),
      profileHasEmbedding: !!(profileResult.data && profileResult.data.profile_embedding)
    };
  }

  /**
   * Ensure both embeddings exist, generating any that are missing.
   * This is the primary entry point called during the application flow.
   *
   * @param {string} jobId       - UUID of the job
   * @param {string} candidateId - UUID of the candidate
   * @returns {Object} { jobEmbeddingResult, profileEmbeddingResult }
   */
  static async ensureEmbeddings(jobId, candidateId) {
    // Fetch raw data for both entities in parallel
    const [jobResult, profileResult] = await Promise.all([
      supabaseAdmin
        .from('jobs')
        .select('title, description, required_skill, qualification, experience_level, location, job_embedding, embedding_text_hash')
        .eq('job_id', jobId)
        .single(),
      supabaseAdmin
        .from('resume_parse_data')
        .select('skills, education, experience_years, profile_embedding, embedding_text_hash')
        .eq('candidate_id', candidateId)
        .single()
    ]);

    if (jobResult.error) {
      throw new Error(`Failed to fetch job ${jobId}: ${jobResult.error.message}`);
    }
    if (profileResult.error) {
      throw new Error(`Failed to fetch profile for candidate ${candidateId}: ${profileResult.error.message}`);
    }

    // Build text representations
    const jobText = this.buildJobText(jobResult.data);
    const profileText = this.buildProfileText(profileResult.data);

    // Generate embeddings (hash-based deduplication happens inside each method)
    const [jobEmbeddingResult, profileEmbeddingResult] = await Promise.all([
      this.generateJobEmbedding(jobId, jobText),
      this.generateProfileEmbedding(candidateId, profileText)
    ]);

    return { jobEmbeddingResult, profileEmbeddingResult };
  }

  // ═══════════════════════════════════════════════════════════════
  //  PRIVATE: Embedding Generation
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate a vector embedding by calling the HuggingFace Inference API.
   * Includes retry logic with exponential backoff for transient failures.
   *
   * @param {string} text - Normalized text to embed
   * @returns {number[]} Array of 384 floating-point numbers
   * @private
   */
  static async _generateEmbedding(text) {
    if (!extractor) {
      console.log("[EmbeddingService] Initializing local embedding pipeline (Xenova/bge-small-en-v1.5)...");
      extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5');
    }

    // Truncate text to stay within model's token window
    const truncatedText = text.substring(0, MAX_INPUT_CHARS);

    try {
      // Generate the embedding vector
      const output = await extractor(truncatedText, { pooling: 'mean', normalize: true });
      
      // Convert Float32Array to standard JS Array
      const embedding = Array.from(output.data);

      // Validate dimension
      if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Unexpected embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${Array.isArray(embedding) ? embedding.length : 'non-array'}`
        );
      }

      return embedding;

    } catch (error) {
      console.error(`[EmbeddingService] Local embedding generation failed:`, error.message);
      throw new Error(`Embedding generation failed: ${error?.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PRIVATE: Database Storage
  // ═══════════════════════════════════════════════════════════════

  /**
   * Store a job embedding and its content hash in the jobs table.
   * @private
   */
  static async _storeJobEmbedding(jobId, embedding, textHash) {
    // Pgvector expects the embedding as a string-formatted array: "[0.1,0.2,...]"
    const vectorString = `[${embedding.join(',')}]`;

    const { error } = await supabaseAdmin
      .from('jobs')
      .update({
        job_embedding: vectorString,
        embedding_text_hash: textHash
      })
      .eq('job_id', jobId);

    if (error) {
      throw new Error(`Failed to store job embedding: ${error.message}`);
    }
  }

  /**
   * Store a profile embedding and its content hash in resume_parse_data.
   * @private
   */
  static async _storeProfileEmbedding(candidateId, embedding, textHash) {
    const vectorString = `[${embedding.join(',')}]`;

    const { error } = await supabaseAdmin
      .from('resume_parse_data')
      .update({
        profile_embedding: vectorString,
        embedding_text_hash: textHash
      })
      .eq('candidate_id', candidateId);

    if (error) {
      throw new Error(`Failed to store profile embedding: ${error.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  PRIVATE: Hash / Cache Helpers
  // ═══════════════════════════════════════════════════════════════

  /**
   * Retrieve the current embedding text hash for a job.
   * Used to determine if regeneration is needed.
   * @private
   */
  static async _getExistingJobHash(jobId) {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('embedding_text_hash')
      .eq('job_id', jobId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Retrieve the current embedding text hash for a candidate profile.
   * Used to determine if regeneration is needed.
   * @private
   */
  static async _getExistingProfileHash(candidateId) {
    const { data, error } = await supabaseAdmin
      .from('resume_parse_data')
      .select('embedding_text_hash')
      .eq('candidate_id', candidateId)
      .single();

    if (error) return null;
    return data;
  }

  // ═══════════════════════════════════════════════════════════════
  //  PRIVATE: Text Processing Utilities
  // ═══════════════════════════════════════════════════════════════

  /**
   * Normalize raw text before embedding generation.
   * Ensures consistent embeddings regardless of formatting differences.
   *
   * Steps:
   * 1. Lowercase
   * 2. Collapse whitespace (newlines, tabs, multiple spaces → single space)
   * 3. Remove special characters that don't add semantic meaning
   * 4. Trim
   *
   * @param {string} text - Raw input text
   * @returns {string} Cleaned, normalized text
   * @private
   */
  static _normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[\r\n\t]+/g, ' ')       // Collapse newlines/tabs to spaces
      .replace(/\s+/g, ' ')              // Collapse multiple spaces
      .replace(/[^\w\s.,;:!?()-]/g, ' ') // Remove non-semantic special chars
      .trim();
  }

  /**
   * Generate an MD5 hash of the normalized text.
   * Used to detect content changes without storing full text.
   *
   * @param {string} text - Normalized text
   * @returns {string} MD5 hex digest
   * @private
   */
  static _hashText(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Async sleep utility for retry delays.
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   * @private
   */
  static _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = EmbeddingService;
