#!/usr/bin/env bash
# One-step start (Mac/Linux). Needs only Python 3.9+.
set -e
cd "$(dirname "$0")/backend"
[ -d .venv ] || python3 -m venv .venv
. .venv/bin/activate
pip install -q -r requirements.txt
[ -f .env ] || cp .env.example .env
echo "Open http://localhost:8000  (add GEMINI_API_KEY to backend/.env for live AI)"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
