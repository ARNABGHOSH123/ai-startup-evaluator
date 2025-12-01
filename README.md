This is an AI analyst startup evaluation project

Authors:-

1. Arnab Ghosh (https://github.com/ARNABGHOSH123)

# AI Startup Evaluator

GenaVentureStartup Capital is an AI Startup Evaluator. It is an end‑to‑end intelligent platform that analyzes startup pitch decks using multi‑agent workflows. Founders can upload decks (PDF, email, or audio), and investors can view structured deal notes, benchmarks, and AI-assisted clarifications.

---

## Key Features

### **For Founders**

- Upload pitch deck in **PDF**, **email format**, or **audio**.
- Automatic extraction of:
  - Problem, solution, market, team, traction
  - Funding ask, model, metrics
- **Benchmark Agent** scores the startup on:
  - Market strength
  - Team strength
  - Risk levels
  - Category mapping
- **AI-Generated Deal Note** for investors.
- **AI Call Assistant**:
  - Asks founder follow-up questions for missing or unclear data.
  - Saves conversation to GCP Firestore.
  - Updates investor view automatically.

---

## Multi-Agent Architecture

```
agents/
   extraction_agent.py      # Extracts structured data from the pitch
   benchmark_agent.py       # Benchmarks startup vs. industry data
   deal_note_agent.py       # Generates readable deal note
   call_assistant_agent.py  # Asks questions to fill missing data
```

---

## System Workflow

### **1. Founder Uploads Pitch Deck**

Supported formats:

- PDF
- Email
- Audio (converted to text)

Uploaded file is stored in **GCP Cloud Storage**, job metadata in **Firestore**.

---

### **2. Extraction Agent**

Parses pitch -> converts data into structured JSON.

Example:

```json
{
  "company_name": "FinMate AI",
  "sector": "AI in Finance",
  "funding_ask": "1.5M USD",
  "missing_fields": ["LTV", "CAC", "TAM"]
}
```

---

### **3. Benchmark Agent**

Validates and scores:

- Market size
- Team experience
- Category benchmarks
- Risk analysis
- Strength indicators

Outputs normalized **Deal Note JSON**.

---

### **4. Deal Note Generation Agent**

Creates readable investor-friendly narrative.

---

### **5. AI Call Assistant**

- Founder is asked follow-up questions
- Conversation saved to GCP Firestore
- Visible to investors

---

### **6. Investor Portal**

Investors can:

- View list of evaluated startups
- Apply search filters
- Click any company card to see:
  - Complete deal note
  - Score breakdown
  - Benchmarking outputs
  - Founder–AI conversation
  - Risks & traction

---

## Project Structure

```
## Project Folder Structure — Updated

AI-STARTUP-EVALUATOR/
│
├── agentic_jobs/
│   ├── extract_benchmarking_agent_job/
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   └── agent.py
│   │   │
│   │   ├── assets/
│   │   │   ├── Benchmarking_Framework.pdf
│   │   │   └── rechartjs_description.json
│   │   │
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   │
│   │   ├── llm_model_config/
│   │   │   ├── __init__.py
│   │   │   └── model_config.py
│   │   │
│   │   ├── sub_agents/
│   │   │   ├── __init__.py
│   │   │   ├── benchmarking_startup_agent.py
│   │   │   ├── business_model_sub_agent.py
│   │   │   ├── competitor_analysis_sub_agent.py
│   │   │   ├── extraction_pitch_deck_agent.py
│   │   │   ├── funding_and_financials_sub_agent.py
│   │   │   ├── generate_qna_agent.py
│   │   │   ├── industry_trends_sub_agent.py
│   │   │   ├── investment_recommendation_sub_agent.py
│   │   │   ├── overview_sub_agent.py
│   │   │   ├── partnerships_strategic_analysis_sub_agent.py
│   │   │   ├── team_profiling_sub_agent.py
│   │   │   ├── traction_sub_agent.py
│   │   │   ├── visualisation_agent.py
│   │   │   └── visualisation_focus_points.py
│   │   │
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── analyze_pdf_from_uri.py
│   │   │   ├── extract_webpage_text.py
│   │   │   ├── get_chart_data.py
│   │   │   ├── get_file_content_from_gcs.py
│   │   │   ├── get_gcs_uri_for_file.py
│   │   │   ├── merge_tool.py
│   │   │   ├── save_file_content_to_gcs.py
│   │   │   ├── tavily_search.py
│   │   │   └── update_sub_agent_result_to_firestore.py
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── read_benchmark_framework.py
│   │       ├── text_sanitize.py
│   │       └── Dockerfile
│   │
│   ├── main.py
│   ├── push_image_to_gcp.sh
│   └── requirements.txt
│
├── agents/
|   ├── ai-to-founder-voice-agent/
│   │   ├── agent/
│   │   │   ├── __pycache__/
|   |   |   ├── __init__.py
│   │   │   └── root_agent.py
│   │   │
│   │   ├── base_model/
│   │   │   ├── __pycache__/
|   |   |   ├── __init__.py
│   │   │   └── base_model.py
│   │   │
│   │   ├── config/
|   |   |   ├── __pycache__/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   │
│   │   ├── tools/
│   │   │   ├── __pycache__/
│   │   │   ├── __init__.py
│   │   │   ├── extract_webpage_text.py
│   │   │   ├── get_deck_inv_deal_note.py
│   │   │   ├── get_questions_from_gcs.py
│   │   │   ├── save_file_content_to_gcs.py
│   │   │   └── tavily_search.py
│   │   │
│   │   ├── utils/
│   │   │   ├── __pycache__/
│   │   │   ├── __init__.py
│   │   │   ├── read_benchmark_framework.py
│   │   │   └── text_sanitize.py
│   │   │
│   │   └── venv/
│   │
│   ├── .dockerignore
│   ├── .env.development
│   ├── app.py
│   ├── Dockerfile
|   ├── main.py
│   └── requirements.txt
│
├── backend/
|   ├── __pycache__/
│   ├── config/
│   │   ├── __pycache__/
|   |   ├── __init__.py
│   │   └── config.py
│   │
│   ├── firestore_models/
│   │   ├── __pycache__/
|   |   ├── __init__.py
│   │   └── models.py
│   │
│   ├── routes/
|   |   ├── __pycache__/
│   │   ├── __init__.py
|   |   ├── routes.py
|   |   ├── sub_agents_benchmarking_routes.py
│   │   └── trigger_extract_benchmark_job.py
│   │
│   ├── utils/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   └── helpers.py
│   │   │
│   │   └── venv/
│   │
│   ├── .dockerignore
│   ├── .env.development
│   ├── .gitignore
│   ├── app.py
│   ├── Dockerfile
|   ├── main.py
│   ├── push_image_to_gcp.sh
│   ├── requirements.txt
│   └── startupevaluator-472213-fcc6ea5bd425
│
├── frontend/
│   ├── public/
│   ├── src
│   │   ├── components/
│   │   |   ├── ui/
│   │   |   ├── AudioConversation.tsx
│   │   |   ├── Header.tsx
│   │   |   ├── LoginModal.tsx
│   │   |   ├── PitchDeckForm.tsx
│   │   |   ├── Sidebar.tsx
│   │   |   ├── SignupModal.tsx
│   │   |   └── ThemeProvider.tsx
|   |   |
│   |   ├── context/
│   │   |   └── AuthContext
|   |   │
|   |   ├── hooks/
│   │   |   ├── use-mobile
│   │   |   └── use-toast
│   │   |
│   │   ├── lib/
│   │   |
│   │   ├── pages/
│   │   |   ├── AIGeneratedDealNote.tsx
│   │   |   ├── BussinessModel.tsx
│   │   |   ├── CompanyDetail.tsx
│   │   |   ├── CompetitorsTab.tsx
│   │   |   ├── ComprehensiveAnalysis.tsx
│   │   |   ├── FounderLanding.tsx
│   │   |   ├── FounderPitch.tsx
│   │   |   ├── FoundingTeam.tsx
│   │   |   ├── FourVectorAnalysis.tsx
│   │   |   ├── Home.tsx
│   │   |   ├── InvestmentMemo.tsx
│   │   |   ├── InvestmentWeightage.tsx
│   │   |   ├── InvestorPortal.tsx
│   │   |   ├── Landing.tsx
│   │   |   ├── not-found.tsx
│   │   |   ├── Overview.tsx
│   │   |   ├── PitchCall.tsx
│   │   |   ├── RiskAssessment.tsx
│   │   |   ├── RisksAndStrategicAnalysis.tsx
│   │   |   ├── RoleBasedLanding.tsx
│   │   |   ├── SummaryCard.tsx
│   │   |   ├── SwotAnalysis.tsx
│   │   |   ├── Traction.tsx
│   │   |   ├── UploadDoc.tsx
│   │   |   ├── ViewCompetitors.tsx
│   │   |   ├── ViewFourVector.tsx
│   │   |   ├── ViewFundings.tsx
│   │   |   └── ViewMarketAnalysis.tsx
│   │   |
│   │   ├── utils/
│   │   |   └── audio/
│   │   |
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d
│   │
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── docs/
│   ├── flow.md
│   └── screenshots/
│
├── cloudbuild.yaml
├── .gitignore
└── README.md

```

---

## Technology Stack

### **Frontend**

- React
- TailwindCSS
- ShadCN
- Agentic UI components

### **Backend**

- FastAPI
- Python
- Pub/Sub for async jobs
- GCP Services (Firestore, Cloud Storage, Cloud Functions)

### **AI / LLM**

- Multi-agent orchestration
- Data extraction
- Structured harmonization
- Deal note summarization
- Autonomous data querying (call assistant)

---

## Screenshots

All screenshots used in the documentation are located under:

```
docs/screenshots/
```

Refer to **docs/flow.md** for complete system screenshots.

---

## Documentation

Detailed flow diagrams, architecture, and UI journeys:
`docs/flow.md`

---
