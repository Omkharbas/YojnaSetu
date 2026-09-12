# 🌐 YojnaSetu

### Autonomous Scheme-Bundle Optimizer for Citizens

> Discover the right government schemes. Detect conflicts. Optimize benefits. Take action.

YojnaSetu is an intelligent citizen-benefits platform designed to simplify access to government welfare schemes. It analyzes a citizen's profile, evaluates scheme eligibility, detects conflicts and incompatibilities, recommends an optimized combination of schemes, and helps citizens prepare the required documents and application checklist.

---

## 🎯 Problem Statement

### PS16 — Autonomous Scheme-Bundle Optimizer for Citizens

Citizens may be eligible for multiple government schemes, but identifying the right schemes and determining which combination of benefits can be used together is difficult.

Traditional scheme portals primarily provide information and eligibility criteria. Citizens still have to:

- Search through multiple schemes
- Understand complex eligibility rules
- Compare different benefits
- Identify scheme conflicts and exclusions
- Determine which documents are required
- Decide which schemes should be applied for first

### The Core Challenge

> How can we intelligently understand a citizen's profile, identify eligible schemes, detect conflicts, and recommend the most useful compatible combination of benefits?

---

# 💡 Our Solution

## YojnaSetu

YojnaSetu transforms a citizen profile into a personalized scheme-benefit plan.

Instead of simply returning a list of schemes, the platform follows a multi-stage decision pipeline:

Citizen Profile
      ↓
Profile Analysis
      ↓
Eligibility Evaluation
      ↓
Eligible Schemes
      ↓
Conflict Detection
      ↓
Benefit Comparison
      ↓
Bundle Optimization
      ↓
Personalized Recommendation
      ↓
Document Verification
      ↓
Application Planning

The result is an actionable recommendation rather than an unranked list of schemes.

---

# ✨ Key Features

## 👤 1. Citizen Profile Management

Citizens can create and update a personalized profile containing information required for scheme analysis, such as:

- Name
- Date of Birth
- Age
- Gender
- State / Location
- Occupation
- Income
- Social category
- Family information
- Other eligibility-related attributes

Profile information is used throughout the eligibility and recommendation workflow.

---

## 🧠 2. Intelligent Eligibility Analysis

The system evaluates the citizen profile against structured scheme eligibility conditions.

Each scheme can be evaluated using conditions such as:

- Age
- Income
- Occupation
- Location
- Category
- Gender
- Family status
- Other scheme-specific criteria

The system provides explainable eligibility results instead of a simple yes/no response.

---

## ⚠️ 3. Conflict Detection

A citizen may qualify for multiple schemes but not every scheme can necessarily be combined.

YojnaSetu identifies:

- Incompatible schemes
- Exclusion conditions
- Overlapping benefits
- Combination restrictions

This prevents the system from recommending an unsuitable scheme bundle.

---

## 📊 4. Scheme-Bundle Optimization

YojnaSetu goes beyond scheme filtering.

The optimization layer evaluates eligible schemes and creates a suitable conflict-free combination based on factors such as:

- Estimated benefit
- Eligibility confidence
- Scheme priority
- Document readiness
- Compatibility with other schemes

### Objective

> Select a useful combination of schemes rather than simply displaying every eligible scheme.

---

## 📄 5. Document Intelligence

Citizens can upload government documents such as:

- Aadhaar
- PAN
- Income Certificate
- Caste Certificate
- Domicile Certificate
- Other supported documents

The document-verification pipeline uses OCR and AI-assisted field extraction to identify information such as:

- Name
- Date of Birth
- Document Number

Extracted information can then be compared against the citizen profile.

### Verification Examples

✅ Name matches citizen profile
✅ Date of birth matches citizen profile
✅ Selected document type matches detected document type
❌ Document information does not match profile
⚠️ Additional review required

> Important: Document verification is a preliminary consistency check and does not establish official government authenticity.

---

## 🤖 6. AI Citizen Assistant

YojnaSetu includes an AI-assisted conversational interface that helps citizens understand:

- Government schemes
- Eligibility requirements
- Recommended benefits
- Application requirements
- Document requirements

The assistant is designed to work alongside the structured decision engine rather than replacing deterministic validation.

---

## ✅ 7. Application Planner

After scheme recommendations are generated, YojnaSetu helps the citizen move from discovery to action.

The application planner can provide:

- Recommended schemes
- Required documents
- Missing-document information
- Application checklist
- Progress tracking

---

# 🏗️ System Architecture

                         ┌───────────────────┐
                         │      CITIZEN      │
                         └─────────┬─────────┘
                                   │
                                   ↓
                         ┌───────────────────┐
                         │  React Frontend   │
                         │    Vite + UI      │
                         └─────────┬─────────┘
                                   │
                                   ↓
                         ┌───────────────────┐
                         │  FastAPI Backend  │
                         └─────────┬─────────┘
                                   │
                                   ↓
                       ┌────────────────────────┐
                       │ Agent / AI Orchestrator│
                       └───────────┬────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ↓                    ↓                    ↓
      ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
      │ Eligibility   │    │    Conflict   │    │ Optimization  │
      │    Engine     │    │    Detector   │    │     Engine    │
      └───────┬───────┘    └───────┬───────┘    └───────┬───────┘
              └────────────────────┼────────────────────┘
                                   ↓
                     ┌────────────────────────┐
                     │ Scheme Knowledge Base  │
                     └────────────────────────┘

                         Document Upload
                               ↓
                         Tesseract OCR
                               ↓
                    AI-Assisted Field Extraction
                               ↓
                     Profile Comparison
                               ↓
                    Verification Result

---

# 🔄 Agentic Decision Workflow

             CITIZEN PROFILE
                    ↓
             Understand Input
                    ↓
            Analyze Eligibility
                    ↓
              Filter Schemes
                    ↓
             Detect Conflicts
                    ↓
             Compare Benefits
                    ↓
             Optimize Bundle
                    ↓
             Explain Result
                    ↓
          PERSONALIZED RECOMMENDATION

### Decision Pipeline

Observe → Reason → Validate → Compare → Optimize → Recommend

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Lucide React

## Backend

- Python
- FastAPI
- REST APIs
- SQLite

## AI / Agent Layer

- LangChain
- Ollama
- Local LLM
- AI-assisted field extraction
- AI conversational assistant

## Decision Intelligence

- Eligibility Engine
- Conflict Detection Engine
- Recommendation Engine
- Scheme-Bundle Optimizer

## Document Intelligence

- Tesseract OCR
- PyMuPDF
- Pillow
- AI-assisted document field extraction

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Python Virtual Environment
- npm

---

# 📁 Project Structure

YojnaSetu/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIChatbot.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AppContext.jsx
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── EditProfile.jsx
│   │   │   ├── ProfileSetup.jsx
│   │   │   ├── Analysis.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SchemeExplorer.jsx
│   │   │   └── ApplicationPlanner.jsx
│   │   │
│   │   └── services/
│   │       └── api.js
│   │
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemes.json
│   ├── requirements.txt
│   │
│   ├── auth/
│   │   ├── auth.py
│   │   └── email_service.py
│   │
│   ├── services/
│   │   ├── eligibility_engine.py
│   │   ├── conflict_detector.py
│   │   ├── optimizer.py
│   │   ├── recommendation_engine.py
│   │   ├── document_checker.py
│   │   └── document_verifier.py
│   │
│   └── agent/
│       ├── orchestrator.py
│       └── prompts.py
│
└── README.md

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

- Python 3.12+
- Node.js
- npm
- Git
- Tesseract OCR
- Ollama

---

## 1. Clone the Repository

git clone https://github.com/Omkharbas/YojnaSetu.git
cd YojnaSetu

---

# ⚙️ Backend Setup

Open a terminal:

cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Start the backend:

uvicorn main:app --reload

Backend:

http://localhost:8000

API documentation:

http://localhost:8000/docs

---

# 🎨 Frontend Setup

Open a second terminal:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend:

http://localhost:5173

---

# 🤖 Ollama Setup

Install Ollama and make sure the model used by the application is available.

ollama pull llama3.2

Start Ollama:

ollama serve

YojnaSetu can use the local Ollama model for AI-assisted reasoning, conversational interaction and document field interpretation.

---

# 🧪 Application Flow

1. Register / Login
2. Create Citizen Profile
3. Check Eligibility
4. Analyze Government Schemes
5. Review Eligibility Reasoning
6. Review Conflicts
7. View Optimized Scheme Bundle
8. Check Required Documents
9. Verify Uploaded Documents
10. Create Application Plan

---

# 📊 Dashboard

The dashboard brings together the results of the analysis process.

### Overview

Provides a high-level summary of:

- Eligible schemes
- Conflicts
- Recommended benefits
- Analysis status
- Agent activity

### Eligible Schemes

Displays schemes identified as potentially applicable to the citizen along with eligibility reasoning.

### Conflicts

Shows detected incompatibilities and explains the relevant conflict.

### Recommended Bundle

Displays the optimized combination of schemes with recommendation reasoning.

### Application Planner

Shows required documents and application checklist progress.

---

# 💡 Why YojnaSetu?

Traditional approach:

Search
  ↓
Read eligibility
  ↓
Compare manually
  ↓
Check conflicts manually
  ↓
Choose schemes
  ↓
Find documents
  ↓
Apply

### YojnaSetu

Citizen Profile
      ↓
AI-Assisted Analysis
      ↓
Eligibility
      ↓
Conflict Detection
      ↓
Optimization
      ↓
Recommendation
      ↓
Document Verification
      ↓
Application Plan

> YojnaSetu does not simply tell citizens what schemes exist — it helps them understand which eligible schemes work together and what to do next.

---

# 🔐 Privacy & Security

YojnaSetu is designed with a local-first prototype architecture.

- Citizen profile data is managed through the application backend.
- AI processing can be performed through a local Ollama model.
- The prototype does not claim official government identity verification.
- Document verification provides preliminary consistency checks only.
- Sensitive government identifiers should not be exposed in logs, screenshots or public repositories.

---

# ⚠️ Prototype Disclaimer

This repository is a hackathon prototype.

The scheme knowledge base and eligibility conditions used in the prototype may contain sample or demonstration data. Government schemes, eligibility thresholds, benefit values and document requirements can change.

Before real-world use, scheme information should be verified against authoritative government sources and official application portals.

Document verification performed by this prototype is not official government authentication.

---

# 🔮 Future Scope

- Integration with verified Government of India and State Government APIs
- Real-time scheme database synchronization
- DigiLocker integration
- Multilingual support
- Hindi / Marathi / English conversational assistance
- Voice-based citizen assistant
- Real-time scheme updates
- Automated application submission through official APIs
- More advanced bundle optimization
- Government-source citation for every recommendation
- Improved document verification workflows

---

# 🎯 Project Impact

### For Citizens

- Reduces the time required to discover relevant schemes
- Simplifies complex eligibility criteria
- Helps identify potentially missed benefits
- Prevents unsuitable scheme combinations
- Provides a clear application roadmap

### For Digital Governance

YojnaSetu demonstrates how AI-assisted decision support can make government welfare discovery more personalized, explainable and citizen-centric.

---

# 📌 Project Information

Project: YojnaSetu
Problem ID: PS16
Problem Statement: Autonomous Scheme-Bundle Optimizer for Citizens
Type: Hackathon Prototype
Domain: AI / Agentic AI / Digital Governance / Citizen Services

---

# 🔗 Repository

GitHub:
https://github.com/Omkharbas/YojnaSetu

---

## ❤️ Built for Kurukshetra 2.0 Hackfest 2026

YojnaSetu — Connecting Citizens to the Benefits They Deserve.
