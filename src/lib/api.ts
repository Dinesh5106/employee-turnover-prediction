// Typed fetch client + endpoint functions for the FastAPI backend.
// Base URL configured via VITE_API_URL (defaults to the deployed Render backend).

const DEFAULT_BASE = "https://employee-turnover-prediction-a2qq.onrender.com";
const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) || DEFAULT_BASE;
const BASE = RAW_BASE.replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Render free tier sleeps after inactivity; first request can take up to ~60s.
// Retry network failures a few times with backoff to cover cold-starts.
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const attempts = 4;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);
      let res: Response;
      try {
        res = await fetch(url, {
          ...init,
          signal: init?.signal ?? controller.signal,
          headers: {
            ...(init?.body && !(init.body instanceof FormData)
              ? { "Content-Type": "application/json" }
              : {}),
            ...(init?.headers || {}),
          },
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!res.ok) {
        let msg = res.statusText;
        try {
          const j = await res.json();
          msg = j.detail || j.message || msg;
        } catch { /* noop */ }
        // 502/503/504 during Render cold-start — retry
        if ([502, 503, 504].includes(res.status) && i < attempts - 1) {
          await sleep(2000 * (i + 1));
          continue;
        }
        throw new ApiError(msg, res.status);
      }
      const ct = res.headers.get("content-type") || "";
      return (ct.includes("application/json") ? await res.json() : (await res.text() as unknown)) as T;
    } catch (e) {
      lastErr = e;
      if (e instanceof ApiError) throw e;
      // Network / abort — likely cold start. Retry with backoff.
      if (i < attempts - 1) {
        await sleep(2000 * (i + 1));
        continue;
      }
    }
  }
  const msg = lastErr instanceof Error ? lastErr.message : "Network error";
  throw new ApiError(
    `Unable to reach the backend (${msg}). The server may be waking up — please retry in a few seconds.`,
    0,
  );
}

// ---------- Types
export type DatasetInfo = {
  rows: number; columns: number; missingValues: number; duplicateRows: number;
  dtypes: Record<string, string>; emptyColumns: string[];
  targetColumn: string | null; missingRequired: string[]; columnNames: string[];
};
export type ValidationCheck = { name: string; passed: boolean; detail: string };
export type UploadResult = {
  filename: string; datasetVersion: string;
  info: DatasetInfo; validation: ValidationCheck[];
};
export type DashboardData = {
  hasDataset: boolean; hasModel: boolean; message?: string;
  totalEmployees?: number; atRisk?: number; attritionRate?: number;
  retentionRate?: number; accuracy?: number | null;
  datasetVersion?: string; modelVersion?: string;
  uploadedAt?: string; trainedAt?: string;
};
export type ProcessingStep = { name: string; status: string; detail: string };
export type Metrics = {
  accuracy: number; precision: number; recall: number; f1: number; rocAuc: number;
  confusionMatrix: { tn: number; fp: number; fn: number; tp: number };
  rocCurve: { fpr: number; tpr: number }[];
  classificationReport: Record<string, unknown>;
};
export type TrainResult = {
  algorithm: string; trainingTime: number; metrics: Metrics;
  featureImportance: { feature: string; importance: number }[];
  logs: string[]; modelVersion: string;
};
export type Analytics = {
  departments: { name: string; attrition: number; retained: number }[];
  salary: { range: string; count: number }[];
  age: { age: string; count: number }[];
  gender: { name: string; value: number }[];
  trend: { month: string; attrition: number; hires: number }[];
  satisfaction: { level: string; count: number; attritionRate: number }[];
  overtime: { name: string; attrition: number; retained: number }[];
  featureImportance: { feature: string; importance: number }[];
  employeeDistribution: { name: string; value: number }[];
};
export type PredictInput = {
  Age: number; Department: string; JobRole: string; MonthlyIncome: number;
  YearsAtCompany: number; OverTime: string; JobSatisfaction: number;
  WorkLifeBalance: number; DistanceFromHome: number; Education: number;
  MaritalStatus: string; PerformanceRating: number; Gender?: string;
};
export type PredictResult = {
  prediction: "Leave" | "Stay"; probability: number; confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  topFactors: { feature: string; impact: number; value: number }[];
};
export type BatchPredictResult = {
  count: number;
  predictions: {
    employeeId: string; prediction: string; probability: number;
    riskScore: number; riskLevel: string;
  }[];
};
export type ModelInfo = {
  algorithm: string | null; modelVersion: string | null;
  datasetVersion: string | null; trainedAt: string | null;
  trainingTime: number | null; predictionCount: number;
  hasModel: boolean; features: string[];
};

// ---------- API
export const api = {
  baseUrl: BASE,
  health: () => req<{ status: string; time: string; version: string }>("/health"),
  dashboard: () => req<DashboardData>("/dashboard"),
  uploadDataset: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return req<UploadResult>("/upload-dataset", { method: "POST", body: fd });
  },
  previewDataset: (params: {
    page?: number; limit?: number; search?: string; sort?: string;
    direction?: "asc" | "desc"; filter_col?: string; filter_val?: string;
  }) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && q.set(k, String(v)));
    return req<{ columns: string[]; rows: Record<string, unknown>[]; total: number; page: number; limit: number }>(
      `/dataset/preview?${q.toString()}`);
  },
  downloadDatasetUrl: () => `${BASE}/dataset/download`,
  processData: () => req<{ steps: ProcessingStep[]; features: string[]; elapsedMs: number }>(
    "/process-data", { method: "POST" }),
  train: (algorithm = "random_forest") => req<TrainResult>("/train", {
    method: "POST", body: JSON.stringify({ algorithm }),
  }),
  trainingLogs: () => req<{ logs: string[] }>("/training-logs"),
  metrics: () => req<Metrics>("/metrics"),
  featureImportance: () => req<{ features: { feature: string; importance: number }[] }>("/feature-importance"),
  modelInfo: () => req<ModelInfo>("/model-info"),
  analytics: () => req<Analytics>("/analytics"),
  predict: (input: PredictInput) => req<PredictResult>("/predict", {
    method: "POST", body: JSON.stringify(input),
  }),
  batchPredict: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return req<BatchPredictResult>("/batch-predict", { method: "POST", body: fd });
  },
};
