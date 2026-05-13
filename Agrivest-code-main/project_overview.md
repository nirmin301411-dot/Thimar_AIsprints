# Keheilan — Full Project Overview

> **Status:** AI-Integrated Prototype — backend live, frontend running, fully connected  
> **Last updated:** May 13, 2026

---

## What Is Keheilan?

Keheilan is a **fractional agricultural investment platform** for the Egyptian/African market.

- **Farmers** register their farms and submit funding requests with voice notes
- **Investors** browse verified farm deals and invest fractional amounts starting from small minimums
- **Admins** approve farms, manage the deal pipeline, and monitor AI-generated risk alerts
- **AI** (Groq LLaMA 3.3 70B + LLaMA 3.1 8B + Groq Whisper) powers 9 intelligent features: investor risk classification, personalized deal ranking, deal explanations, portfolio narration, voice-to-text transcription, anomaly detection, viability scoring, and an in-app chat assistant

---

## AI Integration — 9 Features (All Live ✅)

| # | Feature | Endpoint | Model | Provider |
|---|---------|----------|-------|----------|
| 1 | Risk Profiler | `POST /ai/classify-investor` | LLaMA 3.3 70B | Groq |
| 2 | Deal Feed Ranker | `POST /ai/rank-deals` | LLaMA 3.3 70B | Groq |
| 3 | Deal Explainer | `POST /ai/explain-deal` | LLaMA 3.1 8B | Groq |
| 4 | Portfolio Narrator | `POST /ai/narrate-portfolio` | LLaMA 3.1 8B | Groq |
| 5 | Voice Transcription | `POST /ai/transcribe` | Whisper Large v3 | Groq |
| 5b | Text Rewriter | `POST /ai/rewrite-text` | LLaMA 3.1 8B | Groq |
| 6 | Deal Viability Checker | `POST /ai/score-deal` | LLaMA 3.1 8B | Groq |
| 7 | Revenue Anomaly Detector | `POST /ai/detect-anomalies` | LLaMA 3.3 70B | Groq |
| 8 | In-App AI Helper | `POST /ai/chat` | LLaMA 3.3 70B | Groq |

**Single API key required:** `GROQ_API_KEY` from [console.groq.com](https://console.groq.com)  
**Free tier:** ~14,400 requests/day across two quota pools (8B and 70B models run separately)

### AI Architecture

```
keheilan-backend/app/ai/
├── __init__.py
├── gemini_client.py   ← generate() + generate_json() — all 8 text features (backed by Groq LLaMA)
└── groq_client.py     ← transcribe() + chat() — Whisper voice-to-text + LLaMA chat
```

All routes are in `app/routes/ai.py`. Every endpoint includes graceful fallback behavior when API keys are not configured.

> **Note:** `gemini_client.py` is retained for interface compatibility but now routes all calls to Groq open-source models (LLaMA). No Google API key is required.

---

## n8n Workflow Automations — 5 Workflows (All Live ✅)

Keheilan integrates with **n8n cloud** for event-driven workflow automations. The backend fires webhooks asynchronously (fire-and-forget) at key business events — the main API response is never delayed.

| # | Workflow | Trigger Point | Webhook URL | When It Fires |
|---|----------|--------------|-------------|---------------|
| 1 | Revenue Anomaly | `POST /ai/detect-anomalies` | `/webhook/revenue-anomaly` | AI detects medium/high risk anomalies in a deal |
| 2 | KYC Alert | `POST /auth/register` | `/webhook/kyc-alert` | New user registers on the platform |
| 3 | Deal Funded | `POST /investor/invest` | `/webhook/deal-funded` | Investment brings a deal to its funding goal |
| 4 | Deal Closed | `PATCH /deals/:id/status` | `/webhook/deal-closed` | Deal status changes to "closed" |
| 5 | Platform Post | `POST /admin/platform-post` | `/webhook/platform-post` | Admin publishes a platform announcement |

**n8n instance:** `https://eyad7.app.n8n.cloud`  
**Config:** Set `N8N_WEBHOOK_BASE_URL` in `.env`

### n8n Architecture

```
keheilan-backend/app/ai/n8n_client.py
├── notify_revenue_anomaly()    → POST /webhook/revenue-anomaly
├── notify_kyc_submitted()      → POST /webhook/kyc-alert
├── notify_deal_funded()        → POST /webhook/deal-funded
├── notify_deal_closed()        → POST /webhook/deal-closed
└── notify_platform_post()      → POST /webhook/platform-post
```

All webhooks use **background threads** (fire-and-forget). If n8n is unreachable, the main operation still succeeds and a warning is logged.

---

## Project Structure

```
Agrivest-code-main/
├── src/                        ← React frontend (Vite + TypeScript)
└── keheilan-backend/           ← Flask backend (Python)
```

---

## Frontend

**Stack:** Vite + React 19 + TypeScript, custom CSS (dark theme, glassmorphism)

**Running at:** `http://localhost:5173`

### Pages

| Page | Route | API Connected | Description |
|---|---|---|---|
| Login / Register | `/login` (gate) | ✅ `POST /auth/login` + `POST /auth/register` | Tabbed sign-in / registration with auto-login; registration triggers n8n KYC alert |
| Dashboard | `/` | ✅ `GET /admin/stats` + transactions | Stats, activity feed, chart. Admin-only: **Platform Post** (n8n) + **Deal Management** (fund/close deals → n8n) |
| Explore Farms | `/farms` | ✅ `GET /farmer/farms` | Searchable farm cards with funding progress, Live/Mock badge |
| My Portfolio | `/portfolio` | ✅ `GET /investor/portfolio` + `GET /investor/transactions` | Investment tracking, ROI breakdown, transaction history |
| Mutual Pools | `/pools` | ⚠️ mock data | Grouped investment pools |
| AI Insights | `/ai` | ✅ All 9 `/ai/*` endpoints | AI Command Center — tabbed UI for all AI features |
| Market Data | `/market` | ⚠️ mock data | Commodity prices |
| Notifications | `/notifications` | ✅ `GET /admin/alerts` | Live risk alerts with Resolve/Override actions |

### Key Frontend Files

| File | Purpose |
|---|---|
| `src/context/AuthContext.tsx` | Global login state, localStorage persistence, session re-validation |
| `src/api/client.ts` | Base fetch client (session cookies, error handling, base URL) |
| `src/api/auth.ts` | login, register, logout, getMe, onboarding |
| `src/api/farms.ts` | getFarms, getFarmById, createFarm, updateFarmStatus |
| `src/api/deals.ts` | getDeals, getDealById, createDeal, updateDealStatus |
| `src/api/investments.ts` | invest, getPortfolio, getInvestments |
| `src/api/milestones.ts` | getMilestones, submitMilestone, verifyMilestone |
| `src/api/transactions.ts` | getTransactions, getWalletBalance, deposit, withdraw |
| `src/api/admin.ts` | getAlerts, resolveAlert, getAdminStats, approveFarm, rejectFarm, publishPlatformPost, simulateDealFunded |
| `src/api/ai.ts` | All 9 AI features: classifyInvestor, rankDeals, explainDeal, narratePortfolio, transcribeVoice, rewriteText, scoreDeal, detectAnomalies, chatWithAI |
| `src/pages/Login.tsx` | Tabbed Sign In / Register with auto-login after registration |
| `src/pages/Dashboard.tsx` | Admin dashboard with Platform Post (n8n) + Deal Management (fund/close → n8n) |
| `src/pages/AiInsights.tsx` | AI Command Center — tabbed UI with state management for all 9 features |

### Auth Flow

1. User lands → `AuthContext` checks localStorage
2. If stored user found → re-validates with `GET /auth/me`
3. If valid → shows app; otherwise → shows Login page
4. **Login** → `POST /auth/login` → stores user in context + localStorage
5. **Register** → `POST /auth/register` (triggers n8n KYC alert) → auto-calls `POST /auth/login` → user is immediately logged in
6. Logout → `POST /auth/logout` → clears Flask session + localStorage

---

## Backend

**Stack:** Python 3.11, Flask 3.1, Flask-SQLAlchemy, Flask-Migrate, Flask-CORS

**Running at:** `http://127.0.0.1:5000`

**Database:** SQLite locally (`instance/keheilan.db`) → PostgreSQL on Railway (set `DATABASE_URL` env var)

### Architecture

```
keheilan-backend/
├── run.py                       ← Entry point (loads .env via python-dotenv)
├── seed.py                      ← Populates DB with realistic test data
├── .env                         ← Environment config (gitignored)
├── requirements.txt
├── Procfile                     ← Railway: gunicorn "app:create_app()"
└── app/
    ├── __init__.py              ← App factory (create_app)
    ├── config/
    │   ├── config.py            ← All env vars in one Config class
    │   └── database.py          ← db = SQLAlchemy(), init_db()
    ├── ai/                      ← AI client wrappers
    │   ├── gemini_client.py     ← generate() + generate_json() → backed by Groq LLaMA
    │   ├── groq_client.py       ← transcribe() (Whisper) + chat() (LLaMA 3.3 70B)
    │   └── n8n_client.py        ← Fire-and-forget webhook triggers for 5 n8n workflows
    ├── models/                  ← SQLAlchemy models
    │   ├── user.py
    │   ├── farm.py
    │   ├── deal.py
    │   ├── investment.py
    │   ├── milestone.py
    │   ├── transaction.py
    │   └── alert.py
    ├── routes/                  ← Flask blueprints (HTTP layer only)
    │   ├── auth.py
    │   ├── investor.py
    │   ├── farmer.py
    │   ├── admin.py
    │   └── ai.py                ← All 9 AI endpoints with graceful fallbacks
    └── services/                ← Business logic layer
        ├── investor_service.py
        ├── farmer_service.py
        ├── wallet_service.py
        ├── deal_service.py
        └── admin_service.py
```

### Data Models

| Model | Key Fields |
|---|---|
| `User` | id, name, phone, national_id, password, role, governorate, investor_profile |
| `Farm` | id, operator_id, name, governorate, crop_type, land_size_feddans, water_source, status, sustainability_score |
| `Deal` | id, farm_id, model_type, goal_egp, funded_egp, min_ticket_egp, expected_return_pct, duration_months, status, ai_viability_flag |
| `Investment` | id, investor_id, deal_id, amount_egp, status, invested_at, expected_return_date |
| `Milestone` | id, farm_id, deal_id, type, status, raw_input, ai_converted_text, photo_url |
| `Transaction` | id, user_id, type (deposit/allocation/return/withdrawal), amount_egp, deal_id |
| `Alert` | id, deal_id, flag_reason, severity, status, ai_reasoning |

### API Routes (49 total)

| Blueprint | Endpoints |
|---|---|
| `/auth` | POST /register *(+n8n kyc-alert + auto-login)*, POST /login, POST /logout, GET /me, POST /onboarding |
| `/farmer` | GET/POST /farms, GET/PATCH /farms/:id, PATCH /farms/:id/status, GET/POST /milestones, GET/PATCH /milestones/:id, PATCH /milestones/:id/verify |
| `/investor` | GET/POST /deals, GET /deals/:id, PATCH /deals/:id/status *(+n8n deal-closed)*, POST /invest *(+n8n deal-funded)*, GET /portfolio, GET /investments, GET /wallet, GET /transactions, POST /deposit, POST /withdraw |
| `/admin` | GET /stats, GET/POST /alerts, PATCH /alerts/:id/resolve, PATCH /alerts/:id/override, GET /users, GET /farms, PATCH /farms/:id/approve, PATCH /farms/:id/reject, **POST /platform-post** *(+n8n)*, **POST /deals/:id/simulate-funded** *(test tool +n8n)* |
| `/ai` | POST /classify-investor, POST /rank-deals, POST /explain-deal, POST /narrate-portfolio, POST /transcribe, POST /rewrite-text, POST /score-deal, POST /detect-anomalies *(+n8n revenue-anomaly)*, POST /chat |

### Service Layer

Routes delegate business logic to services:

| Service | Responsibility |
|---|---|
| `investor_service` | Portfolio calculation (pro-rated ROI), invest_in_deal with balance check |
| `wallet_service` | Balance computed from Transaction records, deposit/withdraw |
| `deal_service` | Deal listing with filters, ranking by investor profile |
| `farmer_service` | Milestone submission, farm ownership checks |
| `admin_service` | Platform analytics, deal pipeline, alert management |

---

## Seed Data (test accounts)

| Role | Phone | Password |
|---|---|---|
| Admin | `01000000000` | `admin123` |
| Farmer | `01111111111` | `farmer123` |
| Investor | `01222222221` | `invest123` |

**Seeded:** 17 users (2 admins, 8 farmers, 7 investors), 8 farms (avocado, tea, mango, coffee, hydroponic, rice, dates, herbs), 8 deals (4 active, 4 fundraising), 17 investments, 14 milestones (Arabic voice notes + AI translations), 31 transactions (deposits, allocations, quarterly returns), 5 alerts (3 open, 2 resolved)

---

## How to Run

### Frontend
```powershell
cd Agrivest-code-main
npm run dev
# → http://localhost:5173
```

### Backend
```powershell
cd keheilan-backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
# → http://127.0.0.1:5000
```

### Re-seed the database
```powershell
python seed.py
```

---

## Environment Variables

| Variable | Where to get it | Used for |
|---|---|---|
| `DATABASE_URL` | Railway dashboard | PostgreSQL in production (SQLite locally) |
| `SECRET_KEY` | Any random string | Flask session signing |
| `GROQ_API_KEY` | console.groq.com | **All 9 AI features** — LLaMA text generation + Whisper voice transcription |
| `GEMINI_API_KEY` | aistudio.google.com | Optional — not currently used (system runs fully on Groq) |
| `N8N_WEBHOOK_BASE_URL` | N8N cloud dashboard | **5 workflow automations** — revenue anomaly, KYC, deal funded, deal closed, platform post |
| `AWS_S3_BUCKET` | AWS S3 console | Farm photo uploads |
| `AWS_ACCESS_KEY` | AWS IAM console | S3 authentication |
| `AWS_SECRET_KEY` | AWS IAM console | S3 authentication |

---

## What's Complete vs What's Next

### ✅ Done
- Full data model (7 tables, relationships, serialization)
- All 47 API routes implemented and tested
- Service layer with real business logic (portfolio ROI, wallet balance, deal ranking)
- Frontend-backend connection verified (all field names aligned)
- Auth flow (login, session persistence, logout)
- Seed data matching frontend mock data
- **AI Integration — all 9 features fully live on Groq open-source models:**
  - Backend text engine: `app/ai/gemini_client.py` → LLaMA 3.3 70B + LLaMA 3.1 8B via Groq
  - Backend voice: `app/ai/groq_client.py` → Whisper Large v3 + LLaMA chat
  - Routes: `app/routes/ai.py` (9 endpoints, intelligent token limits, graceful fallbacks)
  - Frontend API: `src/api/ai.ts` (all 9 functions + TypeScript interfaces)
  - Frontend UI: `src/pages/AiInsights.tsx` (AI Command Center, tabbed interface)
  - **Single API key** (`GROQ_API_KEY`) powers everything — no Google dependency
- **n8n Workflow Automations — 5 event-driven workflows integrated:**
  - Revenue anomaly alerts → notifies on high-risk AI detections
  - KYC alerts → triggers on new user registration
  - Deal funded → fires when investment completes a deal's funding goal
  - Deal closed → fires when deal status transitions to closed
  - Platform post → admin publishes announcements via n8n
  - Backend: `app/ai/n8n_client.py` (fire-and-forget webhooks in background threads)
  - Frontend: `src/api/admin.ts` → `publishPlatformPost()` for admin announcements
- Dashboard — live stats from `GET /admin/stats`, real transaction activity feed
- Farms — live farm cards from `GET /farmer/farms`, Live/Mock badge
- Portfolio — live portfolio from `GET /investor/portfolio` + `GET /investor/transactions`
- Notifications — live alerts from `GET /admin/alerts` with working Resolve/Override buttons

### 🔜 Next Steps
1. Wire remaining pages (Pools, Market) to real API data
2. Farm photo uploads via S3 (needs `AWS_*` vars)
3. Deploy to Railway — set `DATABASE_URL` → PostgreSQL, run `flask db upgrade`
4. Add input validation (phone format, national ID format) before going to production
5. Hash passwords (`flask-bcrypt`) before any real user data is stored
6. Restrict CORS to production domain(s) before deployment
7. Add 6th n8n workflow: Multi AI Summary (pending webhook URL)

---

## Key Constraints (Prototype Only)

> ⚠️ These must be fixed before production:
> - Passwords stored as plain text — add `flask-bcrypt`
> - No authentication middleware — add `login_required` decorator to protected routes
> - CORS allows all origins (`*`) — restrict to your production frontend URL
> - SQLite for local development — switch to PostgreSQL via `DATABASE_URL` on Railway
