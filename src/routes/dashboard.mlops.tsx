import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  GitBranch, Database, Wrench, Layers, Cpu, ClipboardCheck, LineChart,
  Github, Box, Rocket, Radio, CheckCircle2, Package,
} from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import { deployHistory } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/mlops")({
  head: () => ({ meta: [{ title: "MLOps Monitor — TurnoverAI" }] }),
  component: MLOps,
});

const cards = [
  { label: "Current Model Version", value: "v2.4.1", icon: Package, tone: "primary" },
  { label: "Latest Training", value: "Jun 28, 2026", icon: Cpu, tone: "secondary" },
  { label: "Model Status", value: "Healthy", icon: CheckCircle2, tone: "success" },
  { label: "Deployment", value: "Production", icon: Rocket, tone: "primary" },
  { label: "Predictions (7d)", value: "48.2k", icon: Radio, tone: "secondary" },
  { label: "Pipeline Status", value: "Passing", icon: CheckCircle2, tone: "success" },
];

const pipeline = [
  { icon: Database, label: "Dataset" },
  { icon: Wrench, label: "Preprocessing" },
  { icon: Layers, label: "Feature Engineering" },
  { icon: Cpu, label: "Model Training" },
  { icon: ClipboardCheck, label: "Evaluation" },
  { icon: LineChart, label: "MLflow Tracking" },
  { icon: Github, label: "GitHub" },
  { icon: GitBranch, label: "CI/CD" },
  { icon: Box, label: "Docker" },
  { icon: Rocket, label: "Deployment" },
  { icon: Radio, label: "Prediction API" },
];

function MLOps() {
  return (
    <>
      <PageHeader
        title="MLOps Monitoring"
        description="End-to-end pipeline health, experiment tracking, and deployment history."
        icon={<GitBranch className="h-5 w-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => {
          const grad =
            c.tone === "success" ? "from-[#22C55E] to-[#059669]" :
            c.tone === "secondary" ? "from-[#7C3AED] to-[#2563EB]" :
            "from-[#2563EB] to-[#7C3AED]";
          return (
            <GlassCard key={c.label} delay={i * 0.04}>
              <div className="flex items-center gap-4">
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-elegant`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="mt-0.5 text-lg font-semibold">{c.value}</div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold">Pipeline Diagram</h3>
          <p className="mb-6 text-xs text-muted-foreground">End-to-end ML pipeline from raw data to production</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pipeline.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex items-center gap-3 rounded-xl border bg-card p-3 shadow-card transition-transform hover:-translate-y-0.5"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-primary text-primary-foreground">
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
                  <div className="truncate text-sm font-medium">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <h3 className="mb-1 text-sm font-semibold">Experiment Tracking</h3>
          <p className="mb-4 text-xs text-muted-foreground">Recent MLflow runs</p>
          <div className="space-y-3">
            {[
              { id: "exp-284", acc: 94.2, dur: "2m 18s", status: "champion" },
              { id: "exp-283", acc: 93.6, dur: "2m 22s", status: "" },
              { id: "exp-282", acc: 92.8, dur: "2m 05s", status: "" },
              { id: "exp-281", acc: 91.4, dur: "1m 58s", status: "" },
            ].map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div>
                  <div className="font-mono text-xs">{e.id}</div>
                  <div className="text-xs text-muted-foreground">{e.dur}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold gradient-text">{e.acc}%</div>
                  {e.status === "champion" && <Badge variant="secondary" className="mt-0.5 text-[10px]">Champion</Badge>}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6">
        <h3 className="mb-1 text-sm font-semibold">Deployment History</h3>
        <p className="mb-6 text-xs text-muted-foreground">Model registry timeline</p>
        <div className="relative space-y-6 border-l-2 border-border pl-6">
          {deployHistory.map((d, i) => (
            <motion.div
              key={d.version}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <div className="absolute -left-[31px] top-1 grid h-5 w-5 place-items-center rounded-full gradient-primary ring-4 ring-background">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-semibold">{d.version}</span>
                <Badge variant={d.status === "Production" ? "default" : "outline"} className={d.status === "Production" ? "gradient-primary text-primary-foreground" : ""}>
                  {d.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{d.date}</span>
              </div>
              <div className="mt-1.5 text-sm text-muted-foreground">{d.note}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}
