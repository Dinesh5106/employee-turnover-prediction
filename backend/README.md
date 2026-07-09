# TurnoverAI FastAPI Backend

Real ML backend for the Employee Turnover Prediction frontend. In-memory state (no DB) — restart clears the dataset and model.

## Run locally

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API is served at `http://localhost:8000`. CORS is open (`*`) for development.

## Wire the frontend

Add this to your Lovable project's environment (create `.env` at project root):

```
VITE_API_URL=http://localhost:8000
```

Restart the dev preview after adding it.

## Dataset requirements

Upload a CSV with (at minimum) these columns. The standard IBM HR Attrition dataset works out of the box:

- `Attrition` (target — Yes/No)
- `Age`, `Department`, `JobRole`, `MonthlyIncome`, `YearsAtCompany`, `OverTime`,
  `JobSatisfaction`, `WorkLifeBalance`, `DistanceFromHome`, `Education`,
  `MaritalStatus`, `PerformanceRating`, `Gender`

## Endpoints

`GET /health`, `GET /dashboard`, `POST /upload-dataset`, `GET /dataset/preview`,
`GET /dataset/download`, `POST /process-data`, `POST /train`,
`GET /training-logs`, `GET /metrics`, `GET /feature-importance`,
`GET /model-info`, `GET /analytics`, `POST /predict`, `POST /batch-predict`.

## Deploy

Any container host works (Render, Railway, Fly.io, Cloud Run). Expose port 8000
and set `VITE_API_URL` on the frontend to the public URL.
