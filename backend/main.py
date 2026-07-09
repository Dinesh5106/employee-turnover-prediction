"""TurnoverAI FastAPI backend — real ML pipeline over an uploaded HR dataset.

State is in-memory. Restart the process to reset. Not for production without
persistence + auth.
"""
from __future__ import annotations

import io
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report, roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

app = FastAPI(title="TurnoverAI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

REQUIRED_COLUMNS = [
    "Attrition", "Age", "Department", "JobRole", "MonthlyIncome",
    "YearsAtCompany", "OverTime", "JobSatisfaction", "WorkLifeBalance",
    "DistanceFromHome", "Education", "MaritalStatus", "PerformanceRating",
]
TARGET_COL = "Attrition"

# --------------------------------------------------------------------------- state
STATE: Dict[str, Any] = {
    "dataset": None,             # pd.DataFrame
    "dataset_filename": None,
    "dataset_version": None,
    "uploaded_at": None,
    "processed": None,           # dict with X_train, X_test, y_train, y_test, encoders, scaler, feature_cols
    "processing_steps": [],
    "model": None,               # sklearn estimator
    "model_name": None,
    "model_version": None,
    "trained_at": None,
    "training_time": None,
    "metrics": None,             # dict
    "feature_importance": None,  # list[{feature, importance}]
    "training_logs": [],
    "prediction_count": 0,
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _dataset_or_400() -> pd.DataFrame:
    if STATE["dataset"] is None:
        raise HTTPException(400, "No dataset uploaded. Upload a CSV first.")
    return STATE["dataset"]


def _processed_or_400() -> Dict[str, Any]:
    if STATE["processed"] is None:
        raise HTTPException(400, "Dataset not processed yet. Run /process-data first.")
    return STATE["processed"]


def _model_or_400():
    if STATE["model"] is None:
        raise HTTPException(400, "No trained model. Train a model first.")
    return STATE["model"]


# ---------------------------------------------------------------------- health/dash
@app.get("/health")
def health():
    return {"status": "ok", "time": _now(), "version": app.version}


@app.get("/dashboard")
def dashboard():
    """Aggregate top-line dashboard state. Empty until data + model exist."""
    df = STATE["dataset"]
    model = STATE["model"]
    if df is None:
        return {
            "hasDataset": False, "hasModel": False,
            "message": "No dataset uploaded. Please upload a dataset to begin.",
        }
    total = int(len(df))
    # If model trained, use predicted-at-risk. Otherwise use dataset labels.
    at_risk = 0
    attrition_rate = 0.0
    if model is not None:
        try:
            X = _transform_for_predict(df.drop(columns=[TARGET_COL], errors="ignore"))
            proba = model.predict_proba(X)[:, 1]
            at_risk = int((proba >= 0.5).sum())
            attrition_rate = round(float(proba.mean()) * 100, 2)
        except Exception:  # pragma: no cover - defensive
            pass
    if at_risk == 0 and TARGET_COL in df.columns:
        at_risk = int((df[TARGET_COL].astype(str).str.lower() == "yes").sum())
        attrition_rate = round(at_risk / max(total, 1) * 100, 2)
    accuracy = STATE["metrics"]["accuracy"] if STATE["metrics"] else None
    return {
        "hasDataset": True,
        "hasModel": model is not None,
        "totalEmployees": total,
        "atRisk": at_risk,
        "attritionRate": attrition_rate,
        "retentionRate": round(100 - attrition_rate, 2),
        "accuracy": accuracy,
        "datasetVersion": STATE["dataset_version"],
        "modelVersion": STATE["model_version"],
        "uploadedAt": STATE["uploaded_at"],
        "trainedAt": STATE["trained_at"],
    }


# --------------------------------------------------------------------------- upload
def _dataset_info(df: pd.DataFrame) -> Dict[str, Any]:
    dtypes = {c: str(df[c].dtype) for c in df.columns}
    missing = int(df.isna().sum().sum())
    duplicates = int(df.duplicated().sum())
    empty_cols = [c for c in df.columns if df[c].isna().all()]
    missing_required = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    return {
        "rows": int(len(df)),
        "columns": int(df.shape[1]),
        "missingValues": missing,
        "duplicateRows": duplicates,
        "dtypes": dtypes,
        "emptyColumns": empty_cols,
        "targetColumn": TARGET_COL if TARGET_COL in df.columns else None,
        "missingRequired": missing_required,
        "columnNames": list(df.columns),
    }


def _validation(df: pd.DataFrame) -> List[Dict[str, Any]]:
    missing_required = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    checks = [
        {"name": "Target column exists", "passed": TARGET_COL in df.columns,
         "detail": f"'{TARGET_COL}' column present" if TARGET_COL in df.columns
         else f"Missing required target column '{TARGET_COL}'"},
        {"name": "Required feature names", "passed": len(missing_required) == 0,
         "detail": "All required columns present" if not missing_required
         else f"Missing: {', '.join(missing_required)}"},
        {"name": "No fully empty columns", "passed": not any(df[c].isna().all() for c in df.columns),
         "detail": "No empty columns"},
        {"name": "Missing values", "passed": True,
         "detail": f"{int(df.isna().sum().sum())} missing values (will be imputed)"},
        {"name": "Duplicate rows", "passed": int(df.duplicated().sum()) == 0,
         "detail": f"{int(df.duplicated().sum())} duplicate rows found"},
        {"name": "Row count sufficient", "passed": len(df) >= 50,
         "detail": f"{len(df)} rows"},
    ]
    return checks


@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a .csv file")
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Failed to parse CSV: {e}")
    STATE["dataset"] = df
    STATE["dataset_filename"] = file.filename
    STATE["dataset_version"] = f"v{uuid.uuid4().hex[:6]}"
    STATE["uploaded_at"] = _now()
    STATE["processed"] = None
    STATE["processing_steps"] = []
    STATE["model"] = None
    STATE["metrics"] = None
    STATE["feature_importance"] = None
    STATE["training_logs"] = []
    return {
        "filename": file.filename,
        "datasetVersion": STATE["dataset_version"],
        "info": _dataset_info(df),
        "validation": _validation(df),
    }


# --------------------------------------------------------------------------- preview
@app.get("/dataset/preview")
def dataset_preview(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=200),
    search: Optional[str] = None,
    sort: Optional[str] = None,
    direction: str = "asc",
    filter_col: Optional[str] = None,
    filter_val: Optional[str] = None,
):
    df = _dataset_or_400().copy()
    if filter_col and filter_val and filter_col in df.columns:
        df = df[df[filter_col].astype(str).str.contains(filter_val, case=False, na=False)]
    if search:
        mask = pd.Series(False, index=df.index)
        for c in df.columns:
            mask |= df[c].astype(str).str.contains(search, case=False, na=False)
        df = df[mask]
    if sort and sort in df.columns:
        df = df.sort_values(sort, ascending=direction == "asc", na_position="last")
    total = int(len(df))
    start = (page - 1) * limit
    page_df = df.iloc[start:start + limit]
    return {
        "columns": list(df.columns),
        "rows": page_df.replace({np.nan: None}).to_dict(orient="records"),
        "total": total, "page": page, "limit": limit,
    }


@app.get("/dataset/download")
def dataset_download():
    df = _dataset_or_400()
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    fname = STATE["dataset_filename"] or "dataset.csv"
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


# --------------------------------------------------------------------------- process
def _prepare(df: pd.DataFrame):
    """Impute, encode, scale, split. Returns processed dict."""
    df = df.copy().drop_duplicates()
    if TARGET_COL not in df.columns:
        raise HTTPException(400, f"Missing target column '{TARGET_COL}'")
    # target -> 0/1
    y = (df[TARGET_COL].astype(str).str.lower() == "yes").astype(int)
    X = df.drop(columns=[TARGET_COL])
    # drop fully-empty
    X = X.dropna(axis=1, how="all")
    # impute
    for c in X.columns:
        if X[c].dtype.kind in "biufc":
            X[c] = X[c].fillna(X[c].median())
        else:
            X[c] = X[c].fillna(X[c].mode().iloc[0] if not X[c].mode().empty else "unknown")
    # encode
    encoders: Dict[str, LabelEncoder] = {}
    for c in X.columns:
        if X[c].dtype == object or str(X[c].dtype).startswith("category"):
            le = LabelEncoder()
            X[c] = le.fit_transform(X[c].astype(str))
            encoders[c] = le
    feature_cols = list(X.columns)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X.values)
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y.values, test_size=0.2, random_state=42, stratify=y.values,
    )
    return {
        "X_train": X_train, "X_test": X_test,
        "y_train": y_train, "y_test": y_test,
        "encoders": encoders, "scaler": scaler,
        "feature_cols": feature_cols,
    }


def _transform_for_predict(df: pd.DataFrame) -> np.ndarray:
    proc = _processed_or_400()
    X = df.copy()
    for c in proc["feature_cols"]:
        if c not in X.columns:
            X[c] = 0
    X = X[proc["feature_cols"]]
    for c in X.columns:
        if X[c].dtype.kind in "biufc":
            X[c] = X[c].fillna(X[c].median() if not X[c].isna().all() else 0)
        else:
            X[c] = X[c].fillna("unknown")
        if c in proc["encoders"]:
            le = proc["encoders"][c]
            known = set(le.classes_)
            X[c] = X[c].astype(str).apply(lambda v: v if v in known else le.classes_[0])
            X[c] = le.transform(X[c])
    return proc["scaler"].transform(X.values)


@app.post("/process-data")
def process_data():
    df = _dataset_or_400()
    steps = []
    t0 = time.time()
    steps.append({"name": "Missing value handling", "status": "done",
                  "detail": f"Imputed {int(df.isna().sum().sum())} missing values"})
    steps.append({"name": "Duplicate removal", "status": "done",
                  "detail": f"Removed {int(df.duplicated().sum())} duplicate rows"})
    proc = _prepare(df)
    steps.append({"name": "Encoding", "status": "done",
                  "detail": f"Label-encoded {len(proc['encoders'])} categorical columns"})
    steps.append({"name": "Feature scaling", "status": "done",
                  "detail": "StandardScaler applied to all features"})
    steps.append({"name": "Train / Test split", "status": "done",
                  "detail": f"Train: {len(proc['X_train'])}, Test: {len(proc['X_test'])} (80/20 stratified)"})
    steps.append({"name": "Feature engineering", "status": "done",
                  "detail": f"{len(proc['feature_cols'])} features prepared"})
    STATE["processed"] = proc
    STATE["processing_steps"] = steps
    return {"steps": steps, "features": proc["feature_cols"],
            "elapsedMs": int((time.time() - t0) * 1000)}


# --------------------------------------------------------------------------- train
class TrainReq(BaseModel):
    algorithm: str = "random_forest"


@app.post("/train")
def train(req: TrainReq):
    proc = _processed_or_400()
    logs: List[str] = []

    def log(msg: str):
        logs.append(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

    log(f"Starting training — algorithm={req.algorithm}")
    log(f"Train samples: {len(proc['X_train'])}, features: {len(proc['feature_cols'])}")

    candidates = {
        "random_forest": RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
    }
    if req.algorithm == "auto":
        best = None
        for name, est in candidates.items():
            t0 = time.time()
            est.fit(proc["X_train"], proc["y_train"])
            preds = est.predict(proc["X_test"])
            acc = accuracy_score(proc["y_test"], preds)
            log(f"{name}: accuracy={acc:.4f} in {time.time()-t0:.2f}s")
            if best is None or acc > best[1]:
                best = (name, acc, est)
        name, _, est = best  # type: ignore
    else:
        est = candidates.get(req.algorithm) or candidates["random_forest"]
        name = req.algorithm if req.algorithm in candidates else "random_forest"

    t0 = time.time()
    est.fit(proc["X_train"], proc["y_train"])
    training_time = time.time() - t0
    log(f"Fit complete in {training_time:.2f}s")

    preds = est.predict(proc["X_test"])
    proba = est.predict_proba(proc["X_test"])[:, 1]
    cm = confusion_matrix(proc["y_test"], preds)
    tn, fp, fn, tp = (int(cm[0][0]), int(cm[0][1]), int(cm[1][0]), int(cm[1][1])) if cm.shape == (2, 2) else (0, 0, 0, 0)
    fpr, tpr, _ = roc_curve(proc["y_test"], proba)
    metrics = {
        "accuracy": round(float(accuracy_score(proc["y_test"], preds)) * 100, 2),
        "precision": round(float(precision_score(proc["y_test"], preds, zero_division=0)) * 100, 2),
        "recall": round(float(recall_score(proc["y_test"], preds, zero_division=0)) * 100, 2),
        "f1": round(float(f1_score(proc["y_test"], preds, zero_division=0)) * 100, 2),
        "rocAuc": round(float(roc_auc_score(proc["y_test"], proba)), 4),
        "confusionMatrix": {"tn": tn, "fp": fp, "fn": fn, "tp": tp},
        "rocCurve": [{"fpr": round(float(a), 4), "tpr": round(float(b), 4)}
                     for a, b in zip(fpr, tpr)],
        "classificationReport": classification_report(
            proc["y_test"], preds, output_dict=True, zero_division=0),
    }
    log(f"Accuracy: {metrics['accuracy']}%  F1: {metrics['f1']}%  AUC: {metrics['rocAuc']}")

    if hasattr(est, "feature_importances_"):
        fi = est.feature_importances_
    elif hasattr(est, "coef_"):
        fi = np.abs(est.coef_[0])
    else:
        fi = np.zeros(len(proc["feature_cols"]))
    fi_norm = fi / (fi.sum() or 1)
    feature_importance = sorted(
        [{"feature": f, "importance": round(float(v), 4)}
         for f, v in zip(proc["feature_cols"], fi_norm)],
        key=lambda x: x["importance"], reverse=True,
    )

    STATE["model"] = est
    STATE["model_name"] = name
    STATE["model_version"] = f"v{uuid.uuid4().hex[:6]}"
    STATE["trained_at"] = _now()
    STATE["training_time"] = round(training_time, 2)
    STATE["metrics"] = metrics
    STATE["feature_importance"] = feature_importance
    STATE["training_logs"] = logs

    return {
        "algorithm": name,
        "trainingTime": STATE["training_time"],
        "metrics": metrics,
        "featureImportance": feature_importance,
        "logs": logs,
        "modelVersion": STATE["model_version"],
    }


@app.get("/training-logs")
def training_logs():
    return {"logs": STATE["training_logs"]}


@app.get("/metrics")
def get_metrics():
    if not STATE["metrics"]:
        raise HTTPException(400, "No trained model.")
    return STATE["metrics"]


@app.get("/feature-importance")
def get_feature_importance():
    if not STATE["feature_importance"]:
        raise HTTPException(400, "No trained model.")
    return {"features": STATE["feature_importance"]}


@app.get("/model-info")
def model_info():
    return {
        "algorithm": STATE["model_name"],
        "modelVersion": STATE["model_version"],
        "datasetVersion": STATE["dataset_version"],
        "trainedAt": STATE["trained_at"],
        "trainingTime": STATE["training_time"],
        "predictionCount": STATE["prediction_count"],
        "hasModel": STATE["model"] is not None,
        "features": STATE["processed"]["feature_cols"] if STATE["processed"] else [],
    }


# ------------------------------------------------------------------------- analytics
def _band(series: pd.Series, bins, labels) -> pd.Series:
    return pd.cut(series, bins=bins, labels=labels, include_lowest=True)


@app.get("/analytics")
def analytics():
    df = _dataset_or_400().copy()
    y = df.get(TARGET_COL, pd.Series(["No"] * len(df))).astype(str).str.lower()
    df["_att"] = (y == "yes").astype(int)

    def by_col(col: str):
        if col not in df.columns:
            return []
        g = df.groupby(col)["_att"].agg(["sum", "count"]).reset_index()
        return [{"name": str(r[col]), "attrition": int(r["sum"]),
                 "retained": int(r["count"] - r["sum"])} for _, r in g.iterrows()]

    salary = []
    if "MonthlyIncome" in df.columns:
        bands = _band(df["MonthlyIncome"],
                      [0, 3000, 5000, 8000, 12000, 18000, 1e9],
                      ["0-3k", "3-5k", "5-8k", "8-12k", "12-18k", "18k+"])
        salary = [{"range": str(k), "count": int(v)}
                  for k, v in bands.value_counts().sort_index().items()]

    age = []
    if "Age" in df.columns:
        bands = _band(df["Age"], [0, 25, 30, 35, 40, 45, 50, 200],
                      ["<25", "26-30", "31-35", "36-40", "41-45", "46-50", "50+"])
        age = [{"age": str(k), "count": int(v)}
               for k, v in bands.value_counts().sort_index().items()]

    gender = []
    if "Gender" in df.columns:
        gender = [{"name": str(k), "value": int(v)}
                  for k, v in df["Gender"].value_counts().items()]

    satisfaction = []
    if "JobSatisfaction" in df.columns:
        g = df.groupby("JobSatisfaction")["_att"].agg(["sum", "count"]).reset_index()
        labels = {1: "Very Low", 2: "Low", 3: "Medium", 4: "High"}
        for _, r in g.iterrows():
            k = int(r["JobSatisfaction"]) if str(r["JobSatisfaction"]).isdigit() else r["JobSatisfaction"]
            satisfaction.append({
                "level": labels.get(k, str(k)),
                "count": int(r["count"]),
                "attritionRate": round(float(r["sum"]) / max(int(r["count"]), 1) * 100, 1),
            })

    overtime = []
    if "OverTime" in df.columns:
        for k, sub in df.groupby("OverTime"):
            att = int(sub["_att"].sum())
            overtime.append({"name": f"{k}",
                             "attrition": att,
                             "retained": int(len(sub) - att)})

    # Monthly trend from YearsAtCompany as a proxy if no date column
    trend = []
    if "YearsAtCompany" in df.columns:
        bands = _band(df["YearsAtCompany"], [-1, 1, 3, 5, 10, 15, 50],
                      ["0-1y", "1-3y", "3-5y", "5-10y", "10-15y", "15y+"])
        g = df.assign(_band=bands).groupby("_band", observed=True)["_att"].agg(["sum", "count"]).reset_index()
        for _, r in g.iterrows():
            trend.append({"month": str(r["_band"]),
                          "attrition": int(r["sum"]),
                          "hires": int(r["count"] - r["sum"])})

    return {
        "departments": by_col("Department"),
        "salary": salary,
        "age": age,
        "gender": gender,
        "trend": trend,
        "satisfaction": satisfaction,
        "overtime": overtime,
        "featureImportance": STATE["feature_importance"] or [],
        "employeeDistribution": [{"name": d["name"], "value": d["attrition"] + d["retained"]}
                                 for d in by_col("Department")],
    }


# -------------------------------------------------------------------------- predict
class PredictReq(BaseModel):
    Age: int
    Department: str
    JobRole: str
    MonthlyIncome: float
    YearsAtCompany: int
    OverTime: str
    JobSatisfaction: int
    WorkLifeBalance: int
    DistanceFromHome: int
    Education: int
    MaritalStatus: str
    PerformanceRating: int
    Gender: Optional[str] = "Male"


def _risk_level(prob: float) -> str:
    if prob >= 0.66:
        return "High"
    if prob >= 0.33:
        return "Medium"
    return "Low"


@app.post("/predict")
def predict(req: PredictReq):
    model = _model_or_400()
    proc = STATE["processed"]
    row = pd.DataFrame([req.model_dump()])
    X = _transform_for_predict(row)
    proba = float(model.predict_proba(X)[0, 1])
    pred = int(proba >= 0.5)
    # top factors: feature_importance * scaled_value magnitude
    imp = np.array([f["importance"] for f in STATE["feature_importance"]])
    fnames = [f["feature"] for f in STATE["feature_importance"]]
    scaled_row = dict(zip(proc["feature_cols"], X[0]))
    contributions = []
    for name, w in zip(fnames, imp):
        val = float(scaled_row.get(name, 0.0))
        contributions.append({
            "feature": name,
            "impact": round(float(w * val), 4),
            "value": round(val, 3),
        })
    contributions.sort(key=lambda x: abs(x["impact"]), reverse=True)
    STATE["prediction_count"] += 1
    return {
        "prediction": "Leave" if pred == 1 else "Stay",
        "probability": round(proba, 4),
        "confidence": round(max(proba, 1 - proba), 4),
        "riskLevel": _risk_level(proba),
        "topFactors": contributions[:8],
    }


@app.post("/batch-predict")
async def batch_predict(file: UploadFile = File(...)):
    model = _model_or_400()
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Failed to parse CSV: {e}")
    ids = df["EmployeeID"] if "EmployeeID" in df.columns else pd.Series(
        [f"E{i+1:04d}" for i in range(len(df))])
    X = _transform_for_predict(df.drop(columns=[TARGET_COL], errors="ignore"))
    proba = model.predict_proba(X)[:, 1]
    results = []
    for i, p in enumerate(proba):
        results.append({
            "employeeId": str(ids.iloc[i]),
            "prediction": "Leave" if p >= 0.5 else "Stay",
            "probability": round(float(p), 4),
            "riskScore": round(float(p) * 100, 1),
            "riskLevel": _risk_level(float(p)),
        })
    STATE["prediction_count"] += len(results)
    return {"count": len(results), "predictions": results}


# ------------------------------------------------------------------------------ run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
