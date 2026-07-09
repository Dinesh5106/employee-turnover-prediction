import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Loader2, ArrowRight, Cpu } from "lucide-react";
import { PageHeader, GlassCard } from "@/components/dashboard/shared";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useModelInfo, useTrain, useDashboard } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/train")({
  head: () => ({ meta: [{ title: "Train Model — TurnoverAI" }] }),
  component: Train,
});

function Train() {
  const [algo, setAlgo] = useState("random_forest");
  const dash = useDashboard();
  const info = useModelInfo();
  const train = useTrain();

  if (dash.isLoading) return <div className="flex items-center py-24 justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>;
  if (!dash.data?.hasDataset) {
    return <><PageHeader title="Train Model" icon={<Play className="h-5 w-5"/>}/><EmptyState /></>;
  }

  const result = train.data;

  return (
    <>
      <PageHeader title="Train Model" description="Train a supervised classifier on your processed dataset." icon={<Play className="h-5 w-5" />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold">Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Algorithm</label>
              <Select value={algo} onValueChange={setAlgo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="random_forest">Random Forest</SelectItem>
                  <SelectItem value="logistic_regression">Logistic Regression</SelectItem>
                  <SelectItem value="auto">Auto (pick best)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" disabled={train.isPending} onClick={() => train.mutate(algo)}
              className="w-full gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
              {train.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Training…</> : "Start Training"}
            </Button>
            {train.isPending && <Progress value={80} className="h-2 animate-pulse" />}
            {result && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/dashboard/performance">View metrics <ArrowRight className="ml-2 h-4 w-4"/></Link>
              </Button>
            )}
          </div>

          <div className="mt-6 space-y-2 border-t pt-4 text-xs text-muted-foreground">
            <Row label="Current model" value={info.data?.algorithm ?? "None"}/>
            <Row label="Model version" value={info.data?.modelVersion ?? "—"}/>
            <Row label="Last trained" value={info.data?.trainedAt ? new Date(info.data.trainedAt).toLocaleString() : "Never"}/>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Training Logs</h3>
          <div className="h-72 overflow-y-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs">
            {result?.logs.length ? result.logs.map((l, i) => <div key={i} className="text-muted-foreground">{l}</div>) :
              <div className="text-muted-foreground">Waiting for training…</div>}
          </div>

          {result && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Metric label="Algorithm" value={result.algorithm} icon={<Cpu className="h-4 w-4"/>} />
              <Metric label="Training Time" value={`${result.trainingTime}s`} />
              <Metric label="Accuracy" value={`${result.metrics.accuracy}%`} />
              <Metric label="Precision" value={`${result.metrics.precision}%`} />
              <Metric label="Recall" value={`${result.metrics.recall}%`} />
              <Metric label="F1" value={`${result.metrics.f1}%`} />
              <Metric label="ROC AUC" value={result.metrics.rocAuc.toFixed(3)} />
            </div>
          )}
        </GlassCard>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span>{label}</span><span className="font-medium text-foreground">{value}</span></div>;
}
function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
