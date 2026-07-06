import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { shapFactors, featureImportance } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/explainable")({
  head: () => ({ meta: [{ title: "Explainable AI — TurnoverAI" }] }),
  component: XAI,
});

function XAI() {
  const maxImp = Math.max(...featureImportance.map(f => f.importance));
  const maxShap = Math.max(
    ...shapFactors.positive.map(f => f.impact),
    ...shapFactors.negative.map(f => Math.abs(f.impact)),
  );

  return (
    <>
      <PageHeader
        title="Explainable AI"
        description="SHAP-based explanations for each prediction — understand what drives risk, not just the outcome."
        icon={<Sparkles className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-1 text-sm font-semibold">Top Important Features (Global)</div>
          <p className="mb-5 text-xs text-muted-foreground">Aggregate feature importance across all predictions</p>
          <div className="space-y-3">
            {featureImportance.map((f, i) => (
              <motion.div
                key={f.feature}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{f.feature}</span>
                  <span className="font-mono text-muted-foreground">{(f.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${(f.importance / maxImp) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 }}
                    className="h-full rounded-full gradient-primary"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <div className="mb-1 text-sm font-semibold">Interactive SHAP Visualization</div>
          <p className="mb-5 text-xs text-muted-foreground">Individual prediction breakdown</p>
          <div className="relative h-72 overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent">
            <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:20px_20px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="mt-3 text-sm font-medium">SHAP Force Plot</div>
                <p className="mt-1.5 max-w-[220px] text-xs text-muted-foreground">
                  Run a prediction to see per-employee force plot with waterfall attribution.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/15 text-destructive">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Positive Factors — Increase Risk</div>
              <p className="text-xs text-muted-foreground">Contributing to a "May Leave" prediction</p>
            </div>
          </div>
          <div className="space-y-3">
            {shapFactors.positive.map((f) => (
              <FactorRow key={f.feature} feature={f.feature} impact={f.impact} max={maxShap} positive />
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--success)]/15 text-[color:var(--success)]">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Negative Factors — Decrease Risk</div>
              <p className="text-xs text-muted-foreground">Contributing to a "Will Stay" prediction</p>
            </div>
          </div>
          <div className="space-y-3">
            {shapFactors.negative.map((f) => (
              <FactorRow key={f.feature} feature={f.feature} impact={f.impact} max={maxShap} />
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function FactorRow({ feature, impact, max, positive }: { feature: string; impact: number; max: number; positive?: boolean }) {
  const width = (Math.abs(impact) / max) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{feature}</span>
        <span className={`font-mono ${positive ? "text-destructive" : "text-[color:var(--success)]"}`}>
          {impact > 0 ? "+" : ""}{impact.toFixed(2)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${positive ? "bg-gradient-to-r from-destructive to-[#F59E0B]" : "bg-gradient-to-r from-[color:var(--success)] to-primary"}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
