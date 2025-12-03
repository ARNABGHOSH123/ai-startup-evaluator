# Problem

Early-stage investors often drown in unstructured startup data — pitch decks, founder calls, emails, and scattered news reports. Traditional analysis is time-consuming, inconsistent, and prone to missing red flags. What’s needed is an AI analyst that can cut through the noise, evaluate startups like a trained associate, and generate investor-ready insights at scale.

# Solution Overview

Building an AI-powered analyst that reviews founder material and public data to create concise, actionable deal notes with clear benchmarks and risk assessments across sectors and geographies.

Solution Capabilities:

- Ingest pitch decks, call transcripts, founder updates, and emails to generate structured deal notes.
- Benchmark startups against sector peers using financial multiples, hiring data, and traction signals.
- Flag potential risk indicators like inconsistent metrics, inflated market size, or unusual churn patterns.
- Summary growth potential and generate investor-ready recommendations tailored to customizable weightages.

# Detailed Solution

### Architecture

![Architecture Diagram](docs/screenshots/architecture.png)

## Technology Stack

### **Frontend**

- React
- TailwindCSS
- ShadCN

### **Backend**

- FastAPI
- Python
- Google ADK (Agent Development Kit)
- Websockets / Bidirectional streaming for audio - audio conversation ([Bidi streaming](https://google.github.io/adk-docs/streaming/custom-streaming-ws/))
- RAG (Retrieval Augmented Generation) - RagManagedDB via Rag Corpus at Vertex AI
- Vertex AI

### **AI / LLM**

- Gemini 2.5 pro
- Gemini 2.5 Live models (for audio - audio conversation)

### GCP Services

- Cloud Firestore
- Cloud Storage
- Cloud build
- Cloud Container registry for Docker images
- Cloud Run for web app backend service and frontend app.
- Cloud Run for hosting bi-directional streaming service for audio conversation
- Agent Engine for weightage adjust gen ai recom agent
- Cloud Run Job for running extraction and benchmarking agent job

### Code folders overview

1. **_agentic_jobs/extract_benchmarking_agent_job_**: Multi-agent job that extracts and benchmarks startup data. It is triggered when a founder uploads a pitch deck.
2. **_agents/ai-to-founder-voice-agent_**: AI Call Assistant agent that interacts with founders to clarify missing or unclear data.
3. **_backend_**: FastAPI backend that manages API routes, Firestore models, and utility functions.
4. **_agents/weightage-adjust-gen-ai-recom-agent_**: Agent that generates investment recommendations based on adjustable weightages.
5. **_agents/investment-deal-note-gen-agent_**: Agent that generates detailed investment deal notes for investors.
6. **_frontend_**: React frontend for founders and investors to interact with the platform.
   All the agents are built using Google ADK (Agent Development Kit) framework and deployed on various GCP services depending on their use case and speed requirements.

- Extraction and Benchmarking Agent Job is deployed as a Cloud Run Job that runs asynchronously when triggered by the backend.
- AI Call Assistant Agent is deployed on Cloud Run with bi-directional streaming support for real-time audio conversation.
- Weightage Adjust Gen AI Recom Agent is deployed on Agent Engine for scalable agent execution. Tracing, AgentOps and Observability are enabled for this agent via Agent Engine.
- Investment Deal Note Gen Agent is also deployed on Agent Engine for generating detailed investment deal notes.

### CI/CD

cloudbuild.yaml is used for building and deploying Docker images to Google Cloud Platform.

---

### Workflow

### **_Founder Uploads Pitch Deck_**

- Supported formats: Text (PDF, docx, etc), Audio (mp3, wav, etc) or videos (mp4, mov, etc)
- Uploaded file is stored in GCP Cloud Storage, job metadata in Firestore.
- Trigger extraction and benchmarking agent job and immediately return response to frontend.

### **_Extraction and Benchmarking Agent Job_**

- **_Extraction Agent_**: Parses pitch -> converts data into structured JSON.
- **_Benchmark Agent_**: Validates and scores market size, team experience, category benchmarks, risk analysis, strength indicators. Outputs normalized Deal Note JSON. It uses sub agents:
  - **_overview_sub_agent.py_**: Generates company overview from pitch deck.
  - **_business_model_sub_agent.py_**: Analyzes the startup's business model.
  - **_team_profiling_sub_agent.py_**: Profiles the founding team.
  - **_traction_sub_agent.py_**: Evaluates the startup's traction.
  - **_funding_and_financials_sub_agent.py_**: Analyzes funding and financial metrics.
  - **_competitor_analysis_sub_agent.py_**: Conducts competitor analysis.
  - **_industry_trends_sub_agent.py_**: Analyzes industry trends.
  - **_partnerships_strategic_analysis_sub_agent.py_**: Evaluates partnerships and strategic positioning.
- **_Investment recommendation_**: Provides investment recommendations.
- **_Generates QnAs_**: Generates questions for the AI Call Assistant to ask the founder for missing or unclear data.

### **_AI Call Assistant_**

- Founder is asked follow-up questions via audio conversation.
- Conversation saved to GCP cloud storage.
- Visible to investors in the investor portal when the QnA is answered.
- Uses bi-directional streaming for real-time audio interaction from Google ADK effectively using WebSockets. Reference: [Bidi streaming](https://google.github.io/adk-docs/streaming/custom-streaming-ws/)

### **_Investor Portal_**

- Investors can view list of evaluated startups, apply search filters, and click any company card to see:
  - Complete deal note
  - Score breakdown
  - Benchmarking outputs
  - Founder–AI conversation
  - Risks & traction
- Investor can generate investment recommendations based on adjustable weightages using Weightage Adjust Gen AI Recom Agent deployed on Agent Engine using the tab "Configure Thesis"

---

### Setup Instructions

1. Clone the repository.
2. Set up GCP project with required services: Firestore, Cloud Storage, Cloud Run, Agent Engine.
3. Configure environment variables in .env.development files for backend and agents.
4. Build and deploy Docker images using cloudbuild.yaml.
5. Install the required Python packages from requirements.txt in each folder using "pip install -r requirements.txt".
6. All the environment variables loadup are present in config/config.py files in each folder.
7. How to run the extraction and benchmarking agent job locally:
   - Navigate to agentic_jobs/extract_benchmarking_agent_job
   - Run "adk web":
     - Choose agents folder
       ![Choose agents folder](docs/screenshots/choose_agents_folder.png)
     - Provide the JSON input in the initial state:
       ![Provide JSON input](docs/screenshots/update_initial_state_exc_bench.png)
     - Inputs in firestore_doc_id (from processed folder) and founder_id (from uploads folder) will be same as used in GCP cloud storage so that it correctly points to the provided pitch deck file present in GCP cloud storage.
       ![GCP cloud storage](docs/screenshots/gcp_cloud_storage_structure.png)
     - Result will be like:
       ![Agent job result](docs/screenshots/adk_web_output_exc_bench.png)
8. How to run the AI Call Assistant agent locally:
   - Navigate to agents/ai-to-founder-voice-agent
   - Run "adk web":
     - Choose agents folder same as for extraction and benchmarking agent job.
     - Provide the JSON input in the initial state from the agent's instructions. Variables within "{{...}}" are to be provided in the update state popup.
     - Instead of text inpiut, you can test with audio input.
     - After the conversation is over, the complete conversation will be available in the GCP cloud storage (updates the qna with the answers).
       ![Audio agent](docs/screenshots/ai_audio_interaction.png)
9. How to run the Weightage Adjust Gen AI Recom Agent locally:

   - Navigate to agents/weightage-adjust-gen-ai-recom-agent
   - Run "adk web":
     - Choose agents folder same as for extraction and benchmarking agent job.
     - Provide the JSON input in the initial state from the agent's instructions.
       ![Weightage adjust agent](docs/screenshots/weightage_agent_adk_web.png)
     - Result will be like (from Agent Engine):
       ![Weightage adjust agent result](docs/screenshots/generate_recom_agent_agent_engine.png)

10. How to run the Investment Deal Note Gen Agent locally:

- Navigate to agents/investment-deal-note-gen-agent
- Run "adk web":
  - Choose agents folder same as for extraction and benchmarking agent job.
  - Provide the JSON input in the initial state from the agent's instructions.
    ![Investment deal note gen agent](docs/screenshots/investment_adk_web.png)
  - Result will be like (from Agent Engine):
    ![Investment deal note gen agent result](docs/screenshots/investment_deal_note_result.png)

---

## Executions and screenshots

1. Extraction and Benchmarking Agent Job execution flow (from frontend):
   a. Business Model Sub Agent
   ![Business Model Sub Agent](docs/screenshots/BusinessAnalysis.png)
   b. Competitor Analysis Sub Agent
   ![Competitor Analysis Sub Agent](docs/screenshots/CompetitorAnalysis.png)
   c. Team Profiling Sub Agent
   ![Team Profiling Sub Agent](docs/screenshots/Teamprofiling.png)
   d. Traction Sub Agent
   ![Traction Sub Agent](docs/screenshots/Traction.png)
   e. Comprehensive Analysis Output
   ![Comprehensive Analysis Output](docs/screenshots/ComprehensiveAnalysis.png)
   f. Overview Sub Agent
   ![Overview Sub Agent](docs/screenshots/Overview.png)
   g. Investment Summary Output
   ![Investment Summary Output](docs/screenshots/InvestmentSummary.png)
   h. Thesis Configuration
   ![Thesis Configuration Input](docs/screenshots/ThesisConfig.png)
   ![Thesis Configuration Output](docs/screenshots/ThesisGeneratedSummary.png)
   i. Risk Assessment Output
   ![Risk Assessment Output](docs/screenshots/Risk&StrategicAnalysis.png)

2. AgentsOps and Observability for Weightage Adjust Gen AI Recom Agent from Agent Engine:
   ![AgentOps Observability 1](docs/screenshots/weightage1.png)
   ![AgentOps Observability 2](docs/screenshots/weightage2.png)
   ![AgentOps Observability 2](docs/screenshots/weightage3.png)
   ![AgentOps Observability 2](docs/screenshots/weightage4.png)
   ![AgentOps Observability 2](docs/screenshots/weightage5.png)

   We enabled OpenTelemetry tracing for this agent in Agent Engine to monitor the agent's performance and execution flow. The agent uses custom tools for RAG retrieval from Vertex AI RAG Managed DB. The agent's execution can be observed in detail using AgentOps dashboard, which provides insights into tool usage, LLM calls, and overall agent behavior.

3. Rag Corpus (startup company wise):
   ![Rag Corpus](docs/screenshots/rag_corpus.png)
   ![Rag corpus json files ingestion](docs/screenshots/files_ingestion_corpus.png)
   ![Rag corpus testing in Vertex AI studio](docs/screenshots/vertex_ai_studio_testing.png)

4. UI Screenshots:
   a. Dark theme company data
   ![Dark theme company data](docs/screenshots/darkThemeCompanyData.png)
   b. Investor dashboard
   ![Investor dashboard](docs/screenshots/darkThemeInvestorDashboard.png)
   c. Guest landing Portal - Company Detail View
   ![Guest landing Portal - Company Detail View](docs/screenshots/GuestLanding.png)

## Deployments

1. **_Frontend (on Cloud Run)_**: [Frontend](https://ai-analyst-frontend-service-842669104353.us-central1.run.app)
   ![Cloud Run Service](docs/screenshots/deployed_frontend.png)
2. **_Backend (on Cloud Run)_**: [Backend](https://ai-analyst-backend-service-842669104353.us-central1.run.app)
   ![Cloud Run Service](docs/screenshots/deployed_backend.png)
3. **_Weightage Agent_**: Agent Engine. Screenshot provided in AgentOps section above.
4. **_Extraction and Benchmarking Agent Job_**: Cloud Run Job
   ![Cloud Run Job](docs/screenshots/extraction_benchmarking_job.png)
5. **_AI Call Assistant Agent_**: Cloud Run with bi-directional streaming support
   ![Cloud Run Service](docs/screenshots/deployed_audio_agent.png)
6. **_Investment deal note Agent_**:
   ![Deal note Agent on Agent Engine](docs/screenshots/investment_deal_note_AE.png)
   ![Deal note Agent working](docs/screenshots/investment_deal_note_working.png)

## Repository Contributors

- [Arnab Ghosh](https://github.com/ARNABGHOSH123)
- [Bhavani Katari](https://github.com/kataribhavani)
