#!/usr/bin/env bash
# Builds a clean commit history, one logical step at a time.
#
#   git init -b main                     # once
#   git remote add origin <your-repo-url>
#   bash scripts/incremental_commits.sh              # commit only
#   PUSH=1 bash scripts/incremental_commits.sh       # commit and push after each step
#
# Uses your own git identity (git config user.name / user.email).
set -euo pipefail
c() { msg="$1"; shift; git add -- "$@"; if ! git diff --cached --quiet; then git commit -q -m "$msg"; echo "✓ $msg"; [ "${PUSH:-0}" = 1 ] && git push -q origin HEAD; fi; return 0; }

c "chore: project scaffold and gitignore" .gitignore
c "feat(backend): FastAPI app, config, error envelope" backend/requirements.txt backend/.env.example backend/app/__init__.py backend/app/main.py backend/app/config.py backend/app/errors.py backend/app/deps.py backend/app/routers/__init__.py backend/app/services/__init__.py
c "feat(backend): strict JSON schemas for all modules" backend/app/schemas.py
c "feat(backend): multimodal LLM client with validation and retry" backend/app/services/llm_client.py backend/app/services/prompts.py
c "feat(backend): image upload processing and quality checks" backend/app/services/images.py
c "feat: site safety and PPE analysis" backend/app/routers/safety.py
c "feat: crack detection and analysis" backend/app/routers/crack.py
c "feat: planning estimator, cost, schedule and floor plan" backend/app/services/estimator.py backend/app/routers/planning.py
c "feat: real estate valuation" backend/app/services/valuation_model.py backend/app/routers/valuation.py
c "feat: daily assistant, weather advisory and knowledge modules" backend/app/routers/assistant.py backend/app/routers/weather.py backend/app/routers/knowledge.py backend/app/services/weather_client.py
c "feat(backend): demo mode sample engine" backend/app/services/mock_data.py
c "test(backend): functional, edge-case and AI-layer tests" backend/tests
c "feat(frontend): Vite + React setup, API client, shared UI" frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/.env.example frontend/src/main.jsx frontend/src/api.js frontend/src/components/ui.jsx frontend/src/styles.css
c "feat(frontend): safety, crack and assistant pages" frontend/src/pages/SafetyPage.jsx frontend/src/pages/CrackPage.jsx frontend/src/pages/AssistantPage.jsx
c "feat(frontend): planning, valuation, weather and knowledge pages" frontend/src/pages/PlanningPage.jsx frontend/src/pages/ValuationPage.jsx frontend/src/pages/WeatherPage.jsx frontend/src/pages/KnowledgePage.jsx frontend/src/components/FloorPlan.jsx frontend/src/components/Gantt.jsx
c "feat(frontend): app shell and navigation" frontend/src/App.jsx
c "docs: README, API contract, testing notes, screenshots" README.md docs scripts
git add -A; if ! git diff --cached --quiet; then git commit -q -m "chore: remaining files"; [ "${PUSH:-0}" = 1 ] && git push -q origin HEAD; fi
echo "Done. Add your demo and GitHub links to README.md, then commit: git commit -am 'docs: add demo and repo links'"
