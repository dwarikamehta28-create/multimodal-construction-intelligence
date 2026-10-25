import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .errors import AppError
from .routers import assistant, crack, knowledge, planning, safety, valuation, weather

log = logging.getLogger("cip")
app = FastAPI(title="Construction Intelligence Platform API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=get_settings().cors_origins, allow_methods=["*"], allow_headers=["*"])


def _err(status, code, message):
    return JSONResponse(status_code=status, content={"ok": False, "error": {"code": code, "message": message}})


@app.exception_handler(AppError)
async def app_error(_: Request, e: AppError):
    return _err(e.status_code, e.code, e.message)


@app.exception_handler(RequestValidationError)
async def validation_error(_: Request, e: RequestValidationError):
    first = e.errors()[0] if e.errors() else {}
    field = ".".join(str(p) for p in first.get("loc", []) if p not in ("body", "query"))
    return _err(422, "invalid_input", f"Invalid input{' for ' + field if field else ''}: {first.get('msg', 'check your values')}.")


@app.exception_handler(Exception)
async def unhandled(_: Request, e: Exception):
    log.exception("Unhandled error")
    return _err(500, "server_error", "Something went wrong on the server.")


@app.get("/api/health")
def health():
    s = get_settings()
    return {"status": "ok", "mode": "demo" if s.llm_provider == "mock" else "live"}


for r in (safety, crack, planning, valuation, assistant, weather, knowledge):
    app.include_router(r.router, prefix="/api")

# Optional: serve the built frontend from the same service (single-host deployment).
_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _dist.is_dir():
    app.mount("/", StaticFiles(directory=_dist, html=True), name="web")
