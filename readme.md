
# AI-Powered Multimodal Construction Intelligence Platform

An AI-powered, full-stack decision-support platform designed to assist construction professionals with image-based analysis, project planning, cost estimation, and construction-related guidance.

## Project Goals

- Analyze construction site images and user-provided descriptions.
- Explore construction safety and crack-analysis workflows.
- Support project planning and preliminary cost estimation.
- Provide AI-generated construction guidance through a web interface.

## Technology Stack

- **Frontend:** React.js, Vite
- **Backend:** Python, FastAPI
- **AI:** Multimodal Large Language Model (planned)
- **Version Control:** Git and GitHub

## Current Progress

- [x] Initialize GitHub repository.
- [x] Set up FastAPI backend.
- [x] Add root and health-check endpoints.
- [ ] Develop image-upload and analysis APIs.
- [ ] Integrate a multimodal AI model.
- [ ] Build the React frontend.
- [ ] Implement planning and valuation features.
- [ ] Test and prepare deployment.

## Run the Backend Locally

Activate the virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
python -m pip install -r backend/requirements.txt
```

Start the development server:

```powershell
python -m uvicorn backend.main:app --reload
```

Open the API documentation at http://127.0.0.1:8000/docs.

## Limitations

AI-generated construction insights are intended for decision support and require professional verification. The project's analysis capabilities are under development.

## Project Status

Under active development.
