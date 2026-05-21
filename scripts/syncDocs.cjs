const fs = require('fs');
const path = require('path');

// Target paths
const paths = {
  embeddingService: path.join(__dirname, '../backend/src/services/embedding.service.js'),
  matchingService: path.join(__dirname, '../backend/src/services/matching.service.js'),
  aiService: path.join(__dirname, '../backend/src/services/aiService.js'),
  interviewController: path.join(__dirname, '../backend/src/controllers/interview.controller.js'),
  rulesMatching: path.join(__dirname, '../rules/README_CV_Matching_Parsing.md'),
  rulesInterview: path.join(__dirname, '../rules/README_Interview_System.md'),
};

/**
 * Clean JSDoc comment text to be readable markdown
 */
function parseJSDoc(comment) {
  const lines = comment.split('\n').map(line => line.replace(/^\s*\*\s?/, '').trim());
  const description = [];
  const params = [];
  let returns = '';

  for (const line of lines) {
    if (line.startsWith('@param')) {
      params.push(line.replace('@param', '').trim());
    } else if (line.startsWith('@returns')) {
      returns = line.replace('@returns', '').trim();
    } else if (line.trim() !== '' && !line.includes('/**') && !line.includes('*/')) {
      description.push(line);
    }
  }

  return {
    description: description.join(' '),
    params,
    returns
  };
}

/**
 * Extract documentation from class files
 */
function extractDocs(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[AutoDoc] File not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const methodRegex = /\/\*\*([^\*]*(?:\*(?!\/)[^\*]*)*)\*\/\s*(?:static\s+|async\s+|static\s+async\s+|async\s+static\s+)?(\w+)\s*\(([^)]*)\)/g;
  const methods = [];
  let match;

  while ((match = methodRegex.exec(content)) !== null) {
    const rawComment = match[1];
    const methodName = match[2];
    const paramsList = match[3].trim();
    const doc = parseJSDoc(rawComment);

    methods.push({
      name: methodName,
      params: paramsList,
      description: doc.description,
      paramsDetailed: doc.params,
      returns: doc.returns
    });
  }

  return methods;
}

/**
 * Format methods list to Markdown documentation
 */
function formatMethodsMarkdown(methods) {
  if (methods.length === 0) return '_No static methods documented._';
  
  return methods.map(m => {
    let md = `### 📌 \`${m.name}(${m.params})\`\n\n`;
    md += `${m.description}\n\n`;
    if (m.paramsDetailed.length > 0) {
      md += `**Parameters:**\n`;
      m.paramsDetailed.forEach(p => {
        md += `- \`${p}\`\n`;
      });
      md += `\n`;
    }
    if (m.returns) {
      md += `**Returns:** \`${m.returns}\`\n\n`;
    }
    md += `---\n\n`;
    return md;
  }).join('\n');
}

/**
 * Build CV-Job Matching & Parsing README
 */
function generateMatchingReadme() {
  console.log('[AutoDoc] Generating CV Matching & Parsing README...');
  
  const aiDocs = extractDocs(paths.aiService).filter(m => m.name === 'parseResume');
  const embeddingDocs = extractDocs(paths.embeddingService);
  const matchingDocs = extractDocs(paths.matchingService);

  const markdown = `# 🧠 CV-Job Matching & Parsing Engine

Welcome to the **CV-Job Matching and Parsing** system of the Xenon AI Recruitment Platform. This system coordinates semantic analysis, content hashing, vector embeddings, and mathematical similarity computations to connect candidates with appropriate jobs.

---

## 🛠️ Architecture & Flow

The system employs a multi-step semantic parsing and matching flow designed to minimize overhead and maximize match accuracy.

\`\`\`mermaid
graph TD
    A[Candidate uploads PDF CV] -->|Text Extraction| B[AIService.parseResume]
    B -->|Groq LLM Parser| C[Extract Skills, Experience, Education]
    C -->|Save to DB| D[(resume_parse_data)]
    D -->|Embedding Text Optimization| E[EmbeddingService.generateProfileEmbedding]
    E -->|BAAI/bge-small-en-v1.5 model| F[Store Profile Vector in DB]
    
    G[Recruiter post Job description] -->|Embedding Text Optimization| H[EmbeddingService.generateJobEmbedding]
    H -->|BAAI/bge-small-en-v1.5 model| I[Store Job Vector in DB]
    
    F & I -->|Cosine Similarity Calculation| J[Supabase match_candidate_to_job RPC]
    J -->|Similarity Score & Threshold| K[MatchingService.processApplicationMatch]
    K -->|If Score >= Threshold| L[Status: selected_for_interview]
    K -->|If Score < Threshold| M[Status: rejected]
\`\`\`

---

## 🚀 Key Features

1. **AI-Powered Resume Parsing**: Uses Groq LLM to analyze raw CV text and extract structured JSON (skills list, education hierarchy, experience years).
2. **Standardized Embedding Space**: Utilizes HuggingFace Inference API to generate 384-dimensional vector embeddings using the **\`BAAI/bge-small-en-v1.5\`** model.
3. **Content Hashing Cache**: Automatically computes MD5 hashes of normalized text to prevent redundant API calls when profile/job details are unchanged.
4. **Vector Distance Search**: Executes high-performance Cosine Similarity operations in-database using PostgreSQL \`pgvector\` extensions.

---

## 📂 Active Code API Documentation

_This section is automatically updated based on class signatures._

## 1. AIService (Parsing Core)
${formatMethodsMarkdown(aiDocs)}

## 2. EmbeddingService (Vector Generation & Hashing)
${formatMethodsMarkdown(embeddingDocs)}

## 3. MatchingService (Decision & Query Engine)
${formatMethodsMarkdown(matchingDocs)}

---
*Note: This documentation was dynamically synchronized with class structures on ${new Date().toLocaleString()}.*
`;

  // Write to rules folder with a warning header
  const rulesMarkdown = `> [!WARNING]
> **DYNAMIC RULE FILE**: Do not edit this file directly. This file is automatically synchronized with active backend class structures and JSDoc parameters by the sync script: \`scripts/syncDocs.cjs\`. Any changes made here will be overwritten on the next project modification.

${markdown}`;
  fs.writeFileSync(paths.rulesMatching, rulesMarkdown, 'utf8');
  console.log('[AutoDoc] CV Matching & Parsing README generated successfully in rules folder.');
}

/**
 * Build Interview System README
 */
function generateInterviewReadme() {
  console.log('[AutoDoc] Generating Interview System README...');
  
  const interviewDocs = extractDocs(paths.interviewController);
  const aiDocs = extractDocs(paths.aiService).filter(m => m.name !== 'parseResume');

  const markdown = `# 🎙️ Adaptive AI Interview System

Welcome to the **Adaptive AI Interview System** of the Xenon AI Recruitment Platform. This workspace hosts candidate interviews, controls timing safety, dynamically scales testing difficulty, and grades candidates using dynamic AI evaluation logic.

---

## 🛠️ System Architecture

The AI Interview system runs an interactive feedback loop between the React Client, the Node/Express backend, Groq LLM, and Supabase.

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor C as Candidate (React)
    participant B as Backend Controller
    participant AI as AIService (LLM Client)
    participant DB as Supabase Database

    C->>B: POST /api/interviews/start { application_id }
    B->>DB: Fetch Application & Job details
    B->>AI: generateAndSaveQuestion (Seq #1)
    AI-->>B: Question text & expected keywords
    B->>DB: Store Question record
    B-->>C: Question #1 text & sequence details

    loop Every question (1 to 5)
        C->>B: POST /api/interviews/:id/answer { question_id, candidate_response }
        B->>AI: evaluateAnswer (Groq LLM grading)
        AI-->>B: Grade (0-10) & constructive feedback
        B->>DB: Store Answer & AI feedback
        alt Sequence < 5
            B->>B: Calculate next difficulty level (Easy/Medium/Hard)
            B->>AI: generateAndSaveQuestion (Next Seq)
            AI-->>B: Next question & keywords
            B->>DB: Store Question record
            B-->>C: nextQuestion details
        else Sequence == 5
            B->>B: Calculate final average score
            B->>DB: Set interview completed & update application status (accepted/rejected)
            B-->>C: finished: true, results stats
        end
    end
    
    C->>B: GET /api/interviews/:id/results
    B->>DB: Fetch full questions, answers, and AI remarks
    B-->>C: Dynamic evaluation scorecard
\`\`\`

---

## 🚀 Key Features

1. **Immersive Distraction-Free UX**: Hides all navigation overlays and standard sidebar layouts during active testing. Provides a center-aligned Typeform-like focus interface.
2. **Secure Token Authorization**: Verifies candidates against public/private row ownership using Supabase session JWT tokens in REST headers.
3. **Adaptive Difficulty Adjustment**: Scales question difficulty (Easy ↔ Medium ↔ Hard) dynamically based on the performance of the candidate's prior answer.
4. **Countdown Safety Hook**: Restricts questions to 300 seconds (5 minutes) per query, utilizing ref-bound handlers to prevent closure loss during auto-submission.
5. **Interactive Scorecard**: Renders beautiful radial gradients matching overall candidate score and detailed accordions containing personalized expert AI evaluations.

---

## 📂 Active Code API Documentation

_This section is automatically updated based on class signatures._

## 1. InterviewController (Routing Handlers)
${formatMethodsMarkdown(interviewDocs)}

## 2. AIService (Adaptive Prompt Generator)
${formatMethodsMarkdown(aiDocs)}

---
*Note: This documentation was dynamically synchronized with class structures on ${new Date().toLocaleString()}.*
`;

  // Write to rules folder with a warning header
  const rulesMarkdown = `> [!WARNING]
> **DYNAMIC RULE FILE**: Do not edit this file directly. This file is automatically synchronized with active backend class structures and JSDoc parameters by the sync script: \`scripts/syncDocs.cjs\`. Any changes made here will be overwritten on the next project modification.

${markdown}`;
  fs.writeFileSync(paths.rulesInterview, rulesMarkdown, 'utf8');
  console.log('[AutoDoc] Interview System README generated successfully in rules folder.');
}

function runSync() {
  try {
    const rulesDir = path.dirname(paths.rulesMatching);
    if (!fs.existsSync(rulesDir)) {
      fs.mkdirSync(rulesDir, { recursive: true });
    }
    generateMatchingReadme();
    generateInterviewReadme();
    console.log('[AutoDoc] All dynamic rules successfully updated in rules folder!');
  } catch (err) {
    console.error('[AutoDoc] Sync failed:', err);
    process.exit(1);
  }
}

// Check for watch mode flag
if (process.argv.includes('--watch')) {
  console.log('[AutoDoc] Starting doc-sync in WATCH mode...');
  runSync();

  const filesToWatch = [
    paths.aiService,
    paths.embeddingService,
    paths.matchingService,
    paths.interviewController
  ];

  filesToWatch.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`[AutoDoc] Watching for changes in: ${path.basename(file)}`);
      let debounceTimer;
      fs.watch(file, (event) => {
        if (event === 'change') {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            console.log(`[AutoDoc] File changed: ${path.basename(file)}. Regenerating documentation...`);
            runSync();
          }, 300); // 300ms debounce
        }
      });
    } else {
      console.warn(`[AutoDoc] Unable to watch missing file: ${file}`);
    }
  });
} else {
  runSync();
}
