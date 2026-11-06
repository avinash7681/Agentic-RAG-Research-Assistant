# PaperPilot – Agentic RAG Research Assistant

PaperPilot is an AI-powered academic research assistant that helps students, researchers, and engineers understand, summarize, compare, and analyze scientific research papers using **Gemini File Search** and a **4-stage Agentic RAG pipeline**.

---

## Key Features

1. **Academic PDF Upload & Ingestion**
   - Upload multiple PDF research papers (up to 30MB each).
   - Ingests papers into a persistent Gemini FileSearchStore via the official `@google/genai` TypeScript SDK.
   - Extracts page-level text, abstracts, author metadata, and page counts.
   - Bundles 3 foundational research papers (*Attention Is All You Need*, *LoRA: Low-Rank Adaptation*, and *Retrieval-Augmented Generation*).

2. **4-Stage Single-Agent RAG Workflow**
   - **Query Planner**: Classifies inquiries (`question_answering`, `paper_summarization`, `paper_comparison`, `research_gap_analysis`, `experiment_planning`) and formulates targeted search strategies.
   - **Retrieval Agent**: Queries Gemini File Search and page indexes to pull grounded passages.
   - **Evidence Checker (Strict 1-Retry Limit)**: Assesses factual sufficiency. If partial or insufficient, rewrites the query and executes retrieval once more.
   - **Response Generator**: Synthesizes structured, technically accurate answers with explicit citations (`[Document Title, Page X]`). Strictly refuses to hallucinate facts absent from the papers.

3. **Multi-Paper Comparison Matrix**
   - Generates side-by-side comparison tables across 6 key axes:
     - Research Problem
     - Proposed Methodology
     - Dataset Used
     - Performance Metrics
     - Results
     - Limitations

4. **Experiment Planner**
   - Formulates novel research experiment protocols: Research Objective, Proposed Experiment, Possible Methodology, Evaluation Metrics, and Expected Challenges.
   - Explicitly distinguishes author-reported empirical facts from proposed novel hypotheses.

5. **Agent Activity Panel**
   - Real-time step-by-step trace showing Query Planning, Retrieval, Evidence Verification (with retry notifications), and Response Generation with latency and execution payloads.

6. **Citation Verifier & Page Viewer**
   - Allows users to inspect the exact original text from any page of an uploaded paper to audit citation authenticity.

7. **Academic Benchmark Test Suite**
   - One-click testing covering comparison, quantitative metric lookup, experiment design, limitation analysis, and negative test verification (detecting and refusing ungrounded premises).

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, React Markdown, Remark GFM
- **Backend**: Node.js, Express, tsx
- **AI & RAG Engine**: Google Gemini API (`gemini-3.8-flash`), Gemini File Search API via `@google/genai` SDK
- **PDF Processing**: `pdf-parse`, `pdf-lib`
- **Packaging**: `archiver`

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 3. Generate Benchmark Sample Papers

```bash
npx tsx scripts/generate_sample_papers.ts
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be accessible at `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
npm run start
```
