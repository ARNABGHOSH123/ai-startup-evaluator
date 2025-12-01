# AI Startup Evaluator — End-to-End System Flow Documentation

This document explains the complete workflow of the **AI Startup Evaluator**, including agent flows, founder journey, investor journey, GCP integrations, and UI behavior.

---

## 1. System Overview

The AI Startup Evaluator allows a **startup founder** to upload a pitch deck in 3 possible formats:

- PDF or PPT pitch deck
- Email pitch summary
- Audio pitch deck (speech-to-text extraction)

The system runs multiple AI agents (extraction, benchmarking, scoring, call assistant) to generate a **Deal Note** that investors can view.

---

## 2. System Architecture

![System Architecture](./screenshots/system_architecture.png)

Major components:

- Frontend (React + Tailwind + Agentic UI)
- Backend (FastAPI + Python + GCP services)
- Agents (LLM-orchestrated workflows)
- Datastore (GCP Firestore / Cloud Storage)
- Authentication (Google Identity or FirebaseAuth)
- Investor Portal UI

---

## 3. Founder Workflow

### 3.1 Founder Login Flow

![Founder Login](./screenshots/founder_login.png)

The founder logs in using Google Auth, then navigates to the Pitch Upload screen.

---

## 4. Pitch Upload Flow

### 4.1 Supported Formats

| Format            | Processing                         |
| ----------------- | ---------------------------------- |
| PDF / PPT         | Sent to extraction agent           |
| Email Text        | Parsed directly → extraction agent |
| Audio (.wav/.mp3) | Speech-to-text → extraction agent  |

---

### 4.2 Upload UI

![Pitch Upload UI](./screenshots/pitch_upload.png)

After upload:

- File is stored in **GCP Cloud Storage**
- A job entry is created in **Firestore**
- Status = `PROCESSING`

---

## 5. Extraction Agent Flow

![Extraction Agent](./screenshots/extraction_agent_flow.png)

Responsibilities:

1. Convert audio → text (if audio)
2. Parse pitch deck sections
3. Identify missing data
4. Convert raw text → structured JSON

Output (sample):

```json
{
  "company_name": "FinMate AI",
  "sector": "AI in Finance",
  "funding_ask": "1.5M USD",
  "team": ["Founder 1", "CTO"],
  "problem": "...",
  "solution": "...",
  "traction": "...",
  "missing_fields": ["CAC", "LTV", "Target Market Size"]
}
```

Estimated time: **~5 minutes**

---

## 6. Benchmark Agent & Scoring

After extraction, a second agent benchmarks the startup against known datasets.

Tasks:

- Market size validation
- Team strength mapping
- Competitive landscape mapping
- Risk scoring
- Strength scoring
- Category mapping

Output → **Deal Note JSON**

![Benchmark Output](./screenshots/benchmark_output.png)

---

## 7. Deal Note Generation

A third agent translates raw JSON → readable **AI-generated Deal Note**

![Deal Note](./screenshots/deal_note.png)

Includes:

- Market
- Problem
- Solution
- Product
- Traction
- Business Model
- Risks & Mitigations
- Funding Ask
- Benchmarked Scores

---

## 8. AI Call Assistant Flow

![Call Assistant](./screenshots/call_assistant_flow.png)

Founder clicks **AI Call Assistant** → System generates LLM-driven questions based on:

- Missing fields
- Contradictions
- Weak areas
- Benchmark gaps

Example:

```text
AI: What is your estimated CAC?
Founder: Around $14.
AI: And expected LTV?
Founder: $120 yearly.
```

Conversation automatically stored in Firestore and visible to investors.

---

## 9. Investor Portal — Company Listing

![Investor Listing](./screenshots/investor_listing.png)

Investors see:

- Company list cards
- Search filters: sector, stage, funding ask, geography
- Each card includes logo, sector, ask, summary, scoring indicators

---

## 10. Detailed Company Analysis UI

![Detailed Analysis](./screenshots/detailed_analysis.png)

Sections include:

- Full Deal Note
- Benchmark data
- Audio transcript
- AI call assistant Q&A
- Score breakdown
- Risk matrix
- Traction indicators

---

## 11. Agent Architecture

```
agents/
   extraction_agent.py
   benchmark_agent.py
   deal_note_agent.py
   call_assistant_agent.py
```

---

## 12. Backend Architecture

![Backend Architecture](./screenshots/backend_architecture.png)

Components:

- FastAPI routes
- Firestore for metadata
- Cloud Storage for files
- Cloud Functions for async jobs
- Pub/Sub triggers for agent work

---

## 13. Frontend Architecture

```
frontend/
   src/
      components/
      pages/
      api/
      agents-ui/
```

---

## 14. Folder Structure

```
AI-STARTUP-EVALUATOR/
├── backend/
├── frontend/
├── agents/
├── agentic_jobs/
├── docs/
│   ├── flow.md
│   ├── screenshots/
├── cloudbuild.yaml
├── .gitignore
└── README.md
```

---

## 15. Screenshots Directory

Place images in:

```
docs/screenshots/
```

---

## 16. Final Notes

This documentation covers:

- Full founder workflow
- Full investor workflow
- Agent behaviors
- Data storage
- Benchmarks
- UI flows
- Architecture diagrams
- File structure
