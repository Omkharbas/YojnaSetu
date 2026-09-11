# YojnaSetu
### Your AI-powered government scheme eligibility & benefits optimizer
**PS16 — Autonomous Scheme-Bundle Optimizer for Citizens**

> ⚠️ **Prototype Disclaimer:** The scheme knowledge base (`backend/schemes.json`) is **sample/demo data** built for this hackathon prototype. Eligibility rules, benefit amounts, and document requirements are illustrative and must be verified against official Government of India / Maharashtra portals before real-world use.



## 1. Project Structure

```
civicbenefit-ai/
│
├── 📄 README.md
├── 📄 .gitignore
│
├── 📁 frontend/
│   │
│   ├── 📄 package.json
│   ├── 📄 package-lock.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   ├── 📄 index.html
│   │
│   └── 📁 src/
│       │
│       ├── 📄 main.jsx
│       ├── 📄 App.jsx
│       ├── 📄 index.css
│       │
│       ├── 📁 components/
│       │   ├── 📄 Navbar.jsx
│       │   ├── 📄 ProtectedRoute.jsx
│       │   └── 📄 ...
│       │
│       ├── 📁 context/
│       │   ├── 📄 AppContext.jsx
│       │   └── 📄 AuthContext.jsx
│       │
│       ├── 📁 pages/
│       │   ├── 📄 Landing.jsx
│       │   ├── 📄 Auth.jsx
│       │   ├── 📄 Profile.jsx
│       │   ├── 📄 EditProfile.jsx
│       │   ├── 📄 Analysis.jsx
│       │   ├── 📄 Dashboard.jsx
│       │   ├── 📄 SchemeExplorer.jsx
│       │   └── 📄 ApplicationPlanner.jsx
│       │
│       └── 📁 services/
│           └── 📄 api.js
│
│
├── 📁 backend/
│   │
│   ├── 📄 main.py
│   ├── 📄 models.py
│   ├── 📄 schemes.json
│   ├── 📄 requirements.txt
│   ├── 📄 .env
│   ├── 📄 .env.example
│   │
│   ├── 📁 auth/
│   │   ├── 📄 __init__.py
│   │   ├── 📄 auth.py
│   │   └── 📄 email_service.py
│   │
│   └── 📁 services/
│       ├── 📄 __init__.py
│       ├── 📄 eligibility_engine.py
│       ├── 📄 conflict_detector.py
│       ├── 📄 recommendation_engine.py
│       ├── 📄 optimizer.py
│       └── 📄 document_checker.py
│
└── 📁 docs/
    ├── 📄 project-overview.md
    ├── 📄 architecture.md
    └── 📄 API-documentation.md
```


## 2. Installation (Windows + VS Code)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at **http://localhost:8000** (interactive API docs at `/docs`).

### Frontend
Open a **second terminal**:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**.

> macOS/Linux: replace `venv\Scripts\activate` with `source venv/bin/activate`.

No API keys are required — the reasoning engine is fully rule-based and runs 100% locally.

---

## 3. Demo Instructions

1. Open **http://localhost:5173**
2. Click **"Check My Eligibility"** on the landing page
3. Click **"Load Demo Citizen"** (loads Rahul Patil, a Maharashtra farmer profile)
4. Click **"Run Analysis"**
5. Watch the **Agent Activity Log** stages animate: Profile Analyzer → Eligibility Reasoner → Conflict Detector → Benefit Optimizer → Document Checker → Application Planner
6. On the **Dashboard**:
   - **Overview** tab — summary cards, agent activity log, value chart
   - **Eligible Schemes** tab — every scheme with full rule-by-rule reasoning (click "Show reasoning")
   - **Conflicts** tab — detected scheme conflicts (e.g. overlapping scholarships) with recommended action
   - **Recommended Bundle** tab — optimized, conflict-free bundle with optimization score, estimated combined value, and "why recommended" explanations
7. Click **"Go to Application Planner"** to show the missing-document report and the checkable application checklist with progress tracking
8. Optionally visit **Scheme Explorer** to search/filter the full 24-scheme knowledge base

---

## 4. Judge Pitch (60–90 seconds)

"Government scheme portals today just list what you *might* qualify for — they don't tell you what to actually do. CivicBenefit AI is an agentic decision-support system: it runs a citizen's profile through an explainable, rule-based reasoning engine that evaluates every scheme, shows exactly which conditions passed, failed, or need verification — no black-box AI. It then detects conflicts between schemes that can't be combined, and instead of dumping every eligible scheme on the citizen, our Bundle Optimizer scores each one on estimated benefit, confidence, priority, and document-readiness to select the single best compatible combination. Finally, it compares the citizen's available documents against what's required and generates a personalized, checkable application checklist. The result: instead of 'here are 13 schemes you might get,' the citizen gets 'here are the 6 schemes to actually apply for, in this order, and here's what you're still missing.' It runs fully offline with a local rule engine, but the architecture is designed to plug directly into a real LLM or government API later — without changing the reasoning pipeline."

---

## 5. Future Scope

- Integrate official Government of India / State scheme APIs for live rules and eligibility thresholds
- Real-time scheme database sync instead of static JSON
- Swap/augment the rule engine with an LLM agent (architecture already separates reasoning from data — see `services/`) for natural-language eligibility explanations and edge-case handling
- DigiLocker integration for automated document verification
- Aadhaar/eKYC-based identity and data pre-fill where legally appropriate
- Direct application submission via scheme portal APIs
- Multilingual (Hindi/Marathi/English) voice assistant for low-literacy citizens
- Push notifications for new scheme launches matching a citizen's profile

---

## Notes on Architecture

- **Explainable by design:** every eligibility decision returns which rules passed/failed/need verification — no opaque scoring.
- **Optimization, not filtering:** `services/optimizer.py` computes a composite score (value, confidence, priority, document-readiness) and greedily builds the highest-scoring conflict-free bundle — an approximation of maximum-weight independent set, appropriate for a real-time explainable prototype.
- **LLM-ready:** the reasoning engine is decoupled from data (schemes.json) and from the API layer, so a real LLM/agent could later replace or augment `eligibility_engine.py` without touching the frontend.
