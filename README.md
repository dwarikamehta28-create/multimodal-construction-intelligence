# SiteSense: AI-Powered Multimodal Construction Intelligence Platform

A full-stack decision-support system for construction teams. It analyses site photos, text and structured project data with a multimodal LLM and returns validated JSON that the React UI renders predictably.

| | |
|---|---|
| **Live demo** | `ADD DEMO LINK HERE` |
| **GitHub** | `ADD GITHUB REPO LINK HERE` |
| **Demo video (optional)** | `ADD LINK HERE` |

## Features

| Module | What it does | How |
|---|---|---|
| Site safety | Hazards, PPE status, safety score, immediate actions from site photos | Multimodal LLM |
| Crack analysis | Crack type, severity, width, probable causes, repair steps, urgency | Multimodal LLM |
| Project planning | Material quantities, cost breakdown, week-by-week schedule, concept floor plan | Deterministic estimator + LLM schedule and risks |
| Property valuation | Indicative value, range, price factors | Deterministic baseline + bounded LLM adjustment (±15%) |
| Daily assistant | Stage-aware answers, actions and checklists, optional photo | Multimodal LLM |
| Weather advisory | 5-day forecast with work suitability and precautions | Open-Meteo (no key) + LLM advice |
| Knowledge | Methods, materials, codes explained at your level | LLM |

**Design choices that keep it reliable**
- **Strict JSON contracts.** Every AI reply is validated against a Pydantic schema. Malformed output triggers one automatic retry with the validation error. Enum-like fields are coerced to safe defaults, so an unexpected value never breaks the UI.
- **Numbers are not left to the LLM.** Quantities, costs, floor layout and the valuation baseline are computed in code. The LLM supplies judgement, not arithmetic.
- **Graceful degradation.** If the AI schedule or weather advice fails, the planning and weather modules fall back to a template or rule-based result and show a warning.
- **Demo mode.** With no API key the server returns sample data through the same schemas, so the app runs for reviewers without credentials.
- **Image safety nets.** Images are decoded and re-encoded server-side. Corrupt or truncated files are rejected with a clear message. Low-resolution, very dark or blank images are accepted with a warning.

## Architecture

```
React (Vite)  ──/api──▶  FastAPI  ──▶  llm_client ──▶ Multimodal LLM (Gemini or Claude API)
   pages/*                routers/*        │  validate JSON (Pydantic), retry once
   Workspace UI           schemas.py       └▶ mock_data (demo mode)
                          services/estimator, valuation_model, weather_client, images
```

Every endpoint returns the same envelope:
```json
{ "ok": true, "mode": "live|demo", "engine": "model name", "warnings": [], "data": { } }
{ "ok": false, "error": { "code": "invalid_image", "message": "…" } }
```
See [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

## Requirements

Hardware: Core i5 (8th gen) / Ryzen 5 or better, 8 GB RAM (16 GB recommended), 256 GB SSD, 10+ Mbps internet.
Software: Windows 10/11, macOS Monterey+ or Ubuntu 20.04+; Chrome, Firefox or Edge; VS Code; Git; **Python 3.9+**; **Node.js 18+**; AWS CLI (for deployment).

## Quick start (only Python needed)

The built UI is included in the zip (`frontend/dist`).

- **Windows:** double-click `run.bat`
- **Mac/Linux:** `bash run.sh`

Then open http://localhost:8000. It runs in demo mode until you add `ANTHROPIC_API_KEY` to `backend/.env` and restart. If you push to GitHub, run `npm run build` in `frontend/` (the `dist` folder is git-ignored).

## Setup (development)

```bash
git clone <your-repo-url> && cd construction-intelligence-platform

# 1. Backend
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # add ANTHROPIC_API_KEY for live AI
uvicorn app.main:app --reload --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                                            # http://localhost:5173
```
Without an API key the header badge shows **Demo mode (sample data)**. With a key it shows **AI connected**.

### Environment variables (backend/.env)
| Variable | Purpose | Default |
|---|---|---|
| `GEMINI_API_KEY` | Enables live AI with Google Gemini. Keep secret, never commit. | empty |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `ANTHROPIC_API_KEY` | Alternative: live AI with Claude | empty (demo mode if both empty) |
| `ANTHROPIC_MODEL` | Model used for all modules | `claude-sonnet-5-5` |
| `LLM_PROVIDER` | `anthropic` or `mock` | auto |
| `MAX_IMAGE_MB` | Per-image upload limit | `5` |
| `CORS_ORIGINS` | Allowed frontend origins (comma separated) | `http://localhost:5173` |

Frontend: `VITE_API_BASE` is only needed when the frontend and API are on different hosts.

## Testing

```bash
cd backend && python -m pytest -q        # 41 tests
cd frontend && npm run build             # compile check
```
Covered: all seven endpoints; missing, oversized, unsupported, corrupt and truncated images; low-res and blank-image warnings; invalid numbers and enums; the AI retry path, give-up path (502) and planning fallback; schema leniency; estimator maths and floor-plan geometry; weather outage. A browser run (Playwright) exercised the main flows, and checked for console errors and mobile overflow. Details in [docs/TESTING.md](docs/TESTING.md).

## Deployment

**Single service (simplest).** Build the UI, and FastAPI serves it from `frontend/dist`:
```bash
cd frontend && npm install && npm run build
cd ../backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
On Render or Railway: build command `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build`, start command `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`, and set `ANTHROPIC_API_KEY` as a secret. On AWS, the same commands run on EC2 or App Runner.

**Split hosting.** Frontend on Vercel or Netlify with `VITE_API_BASE=https://<api-host>`; API on Render/AWS with `CORS_ORIGINS=https://<frontend-host>`.

## Screenshots

![Site safety](docs/screenshots/01-site-safety.png)
![Project planning](docs/screenshots/02-project-planning.png)
![Crack analysis](docs/screenshots/03-crack-analysis.png)
![Valuation](docs/screenshots/04-valuation.png)

(Captured in demo mode. Replace with live-AI screenshots before submission.)

## Known limitations

- AI analysis of photos is advisory. It can miss or misjudge hazards and cracks, and crack width needs a visible scale reference. A qualified engineer must confirm structural findings.
- Material, cost and valuation figures use indicative Indian thumb-rule rates and a small city table. Unknown cities use a default rate. Calibrate with local quotes and registered sales.
- The floor plan is a schematic room-area layout, not an architectural drawing.
- Valuation is not a certified valuation.
- Weather needs internet access to Open-Meteo. Forecast is 5 days.
- Demo mode returns sample data, with only a small built-in knowledge base.
- No user accounts, history or database. Each request is independent.
- Images are limited to 3 per request, 5 MB each, JPEG/PNG/WebP.

## Project structure

```
backend/app/    main.py, config.py, schemas.py, deps.py, errors.py
  routers/      safety, crack, planning, valuation, assistant, weather, knowledge
  services/     llm_client, prompts, images, estimator, valuation_model, weather_client, mock_data
backend/tests/  41 tests
frontend/src/   App.jsx, api.js, pages/*, components/*, styles.css
docs/           API_CONTRACT.md, TESTING.md, screenshots/
scripts/        incremental_commits.sh
```

## Pushing incrementally

`scripts/incremental_commits.sh` creates a clean, step-by-step commit history. See the script header.
