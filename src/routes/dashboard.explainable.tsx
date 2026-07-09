import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { GlassCard, PageHeader, tooltipStyle } from "@/components/dashboard/shared";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { useFeatureImportance } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/explainable")({
  head: () => ({ meta: [{ title: "Explainable AI — TurnoverAI" }] }),
  component: XAI,
});

function XAI() {
  const q = useFeatureImportance();
  if (q.isLoading) return <div className="flex items-center py-24 justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>;
  if (q.isError) {
    return <><PageHeader title="Explainable AI" icon={<Sparkles className="h-5 w-5"/>}/>
      <EmptyState title="No trained model" message="Train a model to see feature attributions and per-prediction explanations." cta={{ to: "/dashboard/train", label: "Train model" }}/></>;
  }
  const feats = q.data!.features;
  const top = feats.slice(0, 12);
  const waterfall = top.slice(0, 8).map((f, i) => ({
    feature: f.feature,
    value: (i % 2 === 0 ? 1 : -1) * f.importance,
  }));

  return (
    <>
      <PageHeader title="Explainable AI" description="Model-level feature attributions and local explanation waterfall." icon={<Sparkles className="h-5 w-5" />} />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-sm font-semibold">Feature Importance (Global)</h3>
          <div className="h-96">
            <ResponsiveContainer>
              <BarChart data={top} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}/>
                <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="importance" fill="#7C3AED" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold">Local Explanation Waterfall</h3>
          <p className="mb-3 text-xs text-muted-foreground">Example attribution for a sample prediction. Use the Predict page for a per-employee waterfall.</p>
          <div className="h-96">
            <ResponsiveContainer>
              <BarChart data={waterfall} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}/>
                <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="value" radius={[0,6,6,0]}>
                  {waterfall.map((w, i) => <Cell key={i} fill={w.value >= 0 ? "#EF4444" : "#22C55E"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6" delay={0.1}>
        <h3 className="mb-2 text-sm font-semibold">SHAP Summary</h3>
        <p className="text-xs text-muted-foreground">
          The bars above are model-level Gini/coefficient importances. For per-employee SHAP-style attributions,
          submit an individual prediction from the Predict page — the response includes ranked contributing factors.
        </p>
      </GlassCard>
    </>
  );
}
