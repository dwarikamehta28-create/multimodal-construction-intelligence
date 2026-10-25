
from fastapi import FastAPI

app = FastAPI(
    title="Construction Intelligence Platform",
    description="AI-powered multimodal construction analysis API",
    version="0.1.0",
)


@app.get("/")
def home():
    return {
        "message": "Construction Intelligence Platform API is running!",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
