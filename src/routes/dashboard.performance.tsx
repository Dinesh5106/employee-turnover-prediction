import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, BarChart, Bar,
} from "recharts";
import { Activity, Award, Timer, Cpu, Loader2 } from "lucide-react";
import { GlassCard, PageHeader, tooltipStyle } from "@/components/dashboard/shared";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { useMetrics, useFeatureImportance, useModelInfo } from "@/hooks/use-api";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard/performance")({
  head: () => ({ meta: [{ title: "Model Performance — TurnoverAI" }] }),
  component: Perf,
});

function Perf() {
  const m = useMetrics();
  const fi = useFeatureImportance();
  const info = useModelInfo();

  if (m.isLoading || info.isLoading) return <div className="flex items-center py-24 justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>;
  if (m.isError) {
    const msg = (m.error as Error).message;
    if (msg.toLowerCase().includes("no trained")) return (
      <><PageHeader title="Model Performance" icon={<Activity className="h-5 w-5"/>}/>
      <EmptyState title="No trained model" message="Upload a dataset and train a model to see evaluation metrics." cta={{ to: "/dashboard/train", label: "Train model" }}/></>
    );
    return <ErrorState message={msg}/>;
  }

  const metrics = m.data!;
  const kpis = [
    { label: "Accuracy", value: metrics.accuracy },
    { label: "Precision", value: metrics.precision },
    { label: "Recall", value: metrics.recall },
    { label: "F1 Score", value: metrics.f1 },
  ];

  return (
    <>
      <PageHeader title="Model Performance" description="Evaluation metrics from your trained model." icon={<Activity className="h-5 w-5" />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Award className="h-5 w-5" />} label="Algorithm" value={info.data?.algorithm ?? "—"} />
        <Kpi icon={<Cpu className="h-5 w-5" />} label="Training Time" value={info.data?.trainingTime ? `${info.data.trainingTime}s` : "—"} />
        <Kpi icon={<Timer className="h-5 w-5" />} label="Predictions" value={info.data?.predictionCount?.toString() ?? "0"} />
        <Kpi icon={<Activity className="h-5 w-5" />} label="AUC-ROC" value={metrics.rocAuc.toFixed(3)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard>
          <h3 className="mb-4 text-sm font-semibold">Evaluation Metrics</h3>
          <div className="space-y-4">
            {kpis.map((k) => (
              <div key={k.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{k.label}</span>
                  <span className="font-mono font-semibold gradient-text">{k.value}%</span>
                </div>
                <Progress value={k.value} className="h-2" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold">ROC Curve</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={metrics.rocCurve}>
                <defs>
                  <linearGradient id="rocG" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
                <XAxis dataKey="fpr" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}/>
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="var(--color-muted-foreground)" strokeDasharray="4 4"/>
                <Line type="monotone" dataKey="tpr" stroke="url(#rocG)" strokeWidth={3} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-sm font-semibold">Confusion Matrix</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div />
            <div className="text-muted-foreground py-2">Predicted Stay</div>
            <div className="text-muted-foreground py-2">Predicted Leave</div>
            <div className="text-muted-foreground self-center">Actual Stay</div>
            <MatrixCell value={metrics.confusionMatrix.tn} label="True Negative" tone="success" />
            <MatrixCell value={metrics.confusionMatrix.fp} label="False Positive" tone="warning" />
            <div className="text-muted-foreground self-center">Actual Leave</div>
            <MatrixCell value={metrics.confusionMatrix.fn} label="False Negative" tone="warning" />
            <MatrixCell value={metrics.confusionMatrix.tp} label="True Positive" tone="success" />
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold">Feature Importance</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={fi.data?.features.slice(0, 10) ?? []} layout="vertical" barSize={16}>
                <defs>
                  <linearGradient id="fiG" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="importance" fill="url(#fiG)" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-base font-semibold">{value}</div>
        </div>
      </div>
    </GlassCard>
  );
}

function MatrixCell({ value, label, tone }: { value: number; label: string; tone: "success" | "warning" }) {
  const c = tone === "success"
    ? "bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/30"
    : "bg-[color:var(--warning)]/10 text-[color:var(--warning)] border-[color:var(--warning)]/30";
  return (
    <div className={`rounded-xl border ${c} p-6`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
