import { createFileRoute } from "@tanstack/react-router";
import { GitBranch, Loader2, Server, Database, Play, Activity, CheckCircle2, XCircle } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useModelInfo, useHealth, useDashboard } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/mlops")({
  head: () => ({ meta: [{ title: "MLOps Monitor — TurnoverAI" }] }),
  component: MLOps,
});

function MLOps() {
  const info = useModelInfo();
  const health = useHealth();
  const dash = useDashboard();

  if (info.isLoading) return <div className="flex items-center py-24 justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>;

  const apiUp = !health.isError && health.data?.status === "ok";
  const items = [
    { label: "API Status", value: apiUp ? "Online" : "Offline", tone: apiUp ? "success" : "danger", icon: Server },
    { label: "Model Version", value: info.data?.modelVersion ?? "—", tone: "default", icon: GitBranch },
    { label: "Dataset Version", value: info.data?.datasetVersion ?? "—", tone: "default", icon: Database },
    { label: "Last Training", value: info.data?.trainedAt ? new Date(info.data.trainedAt).toLocaleString() : "Never", tone: "default", icon: Play },
    { label: "Predictions Served", value: info.data?.predictionCount?.toString() ?? "0", tone: "default", icon: Activity },
    { label: "Model Drift", value: info.data?.hasModel ? "Stable" : "No baseline", tone: info.data?.hasModel ? "success" : "warn", icon: Activity },
  ];

  if (!info.data?.hasModel && !dash.data?.hasDataset) {
    return <><PageHeader title="MLOps Monitor" icon={<GitBranch className="h-5 w-5"/>}/><EmptyState /></>;
  }

  return (
    <>
      <PageHeader title="MLOps Monitor" description="Live status of your data pipeline, model registry, and API." icon={<GitBranch className="h-5 w-5" />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <GlassCard key={it.label}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</div>
                <div className="mt-2 text-lg font-semibold">{it.value}</div>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${
                it.tone === "success" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                : it.tone === "danger" ? "bg-destructive/15 text-destructive"
                : it.tone === "warn" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
                : "gradient-primary text-primary-foreground"
              }`}>
                <it.icon className="h-5 w-5" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-6">
        <h3 className="mb-4 text-sm font-semibold">Pipeline Health</h3>
        <div className="space-y-2 text-sm">
          <PipelineRow ok={apiUp} label="FastAPI backend" />
          <PipelineRow ok={!!dash.data?.hasDataset} label="Dataset uploaded" />
          <PipelineRow ok={!!info.data?.hasModel} label="Model trained" />
        </div>
      </GlassCard>
    </>
  );
}

function PipelineRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" /> : <XCircle className="h-4 w-4 text-destructive" />}
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
