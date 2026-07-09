import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PredictInput } from "@/lib/api";
import { toast } from "sonner";

export const qk = {
  health: ["health"] as const,
  dashboard: ["dashboard"] as const,
  preview: (p: unknown) => ["preview", p] as const,
  metrics: ["metrics"] as const,
  featureImportance: ["feature-importance"] as const,
  modelInfo: ["model-info"] as const,
  analytics: ["analytics"] as const,
  trainingLogs: ["training-logs"] as const,
};

export const useHealth = () => useQuery({
  queryKey: qk.health, queryFn: api.health,
  refetchInterval: 15000, retry: 1,
});
export const useDashboard = () => useQuery({
  queryKey: qk.dashboard, queryFn: api.dashboard, retry: 1,
});
export const useModelInfo = () => useQuery({
  queryKey: qk.modelInfo, queryFn: api.modelInfo, retry: 1,
});
export const useMetrics = () => useQuery({
  queryKey: qk.metrics, queryFn: api.metrics, retry: false,
});
export const useFeatureImportance = () => useQuery({
  queryKey: qk.featureImportance, queryFn: api.featureImportance, retry: false,
});
export const useAnalytics = () => useQuery({
  queryKey: qk.analytics, queryFn: api.analytics, retry: false,
});

export function useUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadDataset(file),
    onSuccess: () => {
      toast.success("Dataset uploaded");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(`Upload failed: ${e.message}`),
  });
}

export function useProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.processData(),
    onSuccess: () => {
      toast.success("Dataset processed");
      qc.invalidateQueries({ queryKey: qk.modelInfo });
    },
    onError: (e: Error) => toast.error(`Processing failed: ${e.message}`),
  });
}

export function useTrain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (algorithm: string) => api.train(algorithm),
    onSuccess: () => {
      toast.success("Model trained successfully");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(`Training failed: ${e.message}`),
  });
}

export function usePredict() {
  return useMutation({
    mutationFn: (input: PredictInput) => api.predict(input),
    onError: (e: Error) => toast.error(`Prediction failed: ${e.message}`),
  });
}

export function useBatchPredict() {
  return useMutation({
    mutationFn: (file: File) => api.batchPredict(file),
    onError: (e: Error) => toast.error(`Batch prediction failed: ${e.message}`),
  });
}
