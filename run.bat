@echo off
REM One-step start (Windows). Needs only Python 3.9+.
cd /d "%~dp0backend"
if not exist .venv python -m venv .venv
call .venv\Scripts\activate
pip install -q -r requirements.txt
if not exist .env copy .env.example .env
echo Open http://localhost:8000  (add GEMINI_API_KEY to backend\.env for live AI)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
