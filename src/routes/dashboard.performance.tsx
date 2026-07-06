import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, BarChart, Bar,
} from "recharts";
import { Activity, Award, Timer, Cpu } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { tooltipStyle } from "./dashboard.index";
import { rocCurve, featureImportance, confusionMatrix } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard/performance")({
  head: () => ({ meta: [{ title: "Model Performance — TurnoverAI" }] }),
  component: Perf,
});

const metrics = [
  { label: "Accuracy", value: 94.2 },
  { label: "Precision", value: 91.6 },
  { label: "Recall", value: 88.4 },
  { label: "F1 Score", value: 90.0 },
];

function Perf() {
  return (
    <>
      <PageHeader
        title="Model Performance"
        description="Evaluation metrics, ROC curve, confusion matrix, and feature importance."
        icon={<Activity className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Model</div>
              <div className="text-base font-semibold">Random Forest</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#059669] text-white shadow-elegant">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Training Time</div>
              <div className="text-base font-semibold">2m 18s</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EAB308] text-white shadow-elegant">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Prediction Time</div>
              <div className="text-base font-semibold">~42ms</div>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.15}>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white shadow-elegant">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">AUC-ROC</div>
              <div className="text-base font-semibold">0.94</div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard>
          <h3 className="mb-4 text-sm font-semibold">Evaluation Metrics</h3>
          <div className="space-y-4">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{m.label}</span>
                  <span className="font-mono font-semibold gradient-text">{m.value}%</span>
                </div>
                <Progress value={m.value} className="h-2" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold">ROC Curve</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={rocCurve}>
                <defs>
                  <linearGradient id="rocG" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
                <XAxis dataKey="fpr" label={{ value: "False Positive Rate", position: "insideBottom", offset: -4, style: { fill: "var(--color-muted-foreground)", fontSize: 11 } }} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}/>
                <YAxis label={{ value: "True Positive Rate", angle: -90, position: "insideLeft", style: { fill: "var(--color-muted-foreground)", fontSize: 11 } }} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}/>
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
            <MatrixCell value={confusionMatrix.tn} label="True Negative" tone="success" />
            <MatrixCell value={confusionMatrix.fp} label="False Positive" tone="warning" />

            <div className="text-muted-foreground self-center">Actual Leave</div>
            <MatrixCell value={confusionMatrix.fn} label="False Negative" tone="warning" />
            <MatrixCell value={confusionMatrix.tp} label="True Positive" tone="success" />
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold">Feature Importance</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={featureImportance} layout="vertical" barSize={16}>
                <defs>
                  <linearGradient id="fiG" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#7C3AED"/>
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
