import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCheck, Sparkles, AlertTriangle, ShieldCheck, Gauge, Lightbulb, Loader2 } from "lucide-react";
import { PageHeader, GlassCard } from "@/components/dashboard/shared";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useModelInfo, usePredict } from "@/hooks/use-api";
import type { PredictResult } from "@/lib/api";

export const Route = createFileRoute("/dashboard/predict")({
  head: () => ({ meta: [{ title: "Employee Prediction — TurnoverAI" }] }),
  component: PredictPage,
});

const DEPARTMENTS = ["Sales", "Research & Development", "Human Resources", "Engineering", "Marketing", "Finance", "Operations"];
const JOB_ROLES = ["Sales Executive", "Research Scientist", "Laboratory Technician", "Manufacturing Director", "Healthcare Representative", "Manager", "Sales Representative", "Research Director", "Human Resources"];

function PredictPage() {
  const info = useModelInfo();
  const predict = usePredict();
  const [name, setName] = useState("Alex Morgan");
  const [form, setForm] = useState({
    Age: 32, Department: "Sales", JobRole: "Sales Executive",
    MonthlyIncome: 5200, YearsAtCompany: 4, OverTime: "No",
    JobSatisfaction: 3, WorkLifeBalance: 3, DistanceFromHome: 12,
    Education: 3, MaritalStatus: "Single", PerformanceRating: 3, Gender: "Female",
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  if (info.isLoading) return <div className="flex items-center py-24 justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>;
  if (!info.data?.hasModel) {
    return <><PageHeader title="Employee Prediction" icon={<UserCheck className="h-5 w-5"/>}/>
      <EmptyState title="No trained model" message="Upload a dataset and train a model before running predictions." cta={{ to: "/dashboard/train", label: "Train model" }}/></>;
  }

  const result = predict.data;
  return (
    <>
      <PageHeader title="Employee Prediction" description="Enter employee attributes to generate a live turnover risk from the trained model." icon={<UserCheck className="h-5 w-5" />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Employee Attributes</h3>
              <p className="text-xs text-muted-foreground">Sent to POST /predict — algorithm: {info.data.algorithm}</p>
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Employee Name (display only)"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label={`Age — ${form.Age}`}><Slider min={18} max={65} step={1} value={[form.Age]} onValueChange={(v) => set("Age", v[0])} /></Field>
            <Field label="Gender"><Sel value={form.Gender} onChange={(v) => set("Gender", v)} options={["Female", "Male"]} /></Field>
            <Field label="Marital Status"><Sel value={form.MaritalStatus} onChange={(v) => set("MaritalStatus", v)} options={["Single", "Married", "Divorced"]} /></Field>
            <Field label="Department"><Sel value={form.Department} onChange={(v) => set("Department", v)} options={DEPARTMENTS} /></Field>
            <Field label="Job Role"><Sel value={form.JobRole} onChange={(v) => set("JobRole", v)} options={JOB_ROLES} /></Field>
            <Field label="Monthly Income"><Input type="number" value={form.MonthlyIncome} onChange={(e) => set("MonthlyIncome", +e.target.value)} /></Field>
            <Field label={`Years at Company — ${form.YearsAtCompany}`}><Slider min={0} max={40} step={1} value={[form.YearsAtCompany]} onValueChange={(v) => set("YearsAtCompany", v[0])} /></Field>
            <Field label={`Education Level — ${form.Education}/5`}><Slider min={1} max={5} step={1} value={[form.Education]} onValueChange={(v) => set("Education", v[0])} /></Field>
            <Field label={`Job Satisfaction — ${form.JobSatisfaction}/4`}><Slider min={1} max={4} step={1} value={[form.JobSatisfaction]} onValueChange={(v) => set("JobSatisfaction", v[0])} /></Field>
            <Field label={`Work-Life Balance — ${form.WorkLifeBalance}/4`}><Slider min={1} max={4} step={1} value={[form.WorkLifeBalance]} onValueChange={(v) => set("WorkLifeBalance", v[0])} /></Field>
            <Field label={`Performance Rating — ${form.PerformanceRating}/5`}><Slider min={1} max={5} step={1} value={[form.PerformanceRating]} onValueChange={(v) => set("PerformanceRating", v[0])} /></Field>
            <Field label={`Distance From Home — ${form.DistanceFromHome} km`}><Slider min={0} max={60} step={1} value={[form.DistanceFromHome]} onValueChange={(v) => set("DistanceFromHome", v[0])} /></Field>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
              <div><div className="text-sm font-medium">Overtime</div><div className="text-xs text-muted-foreground">Regularly works beyond standard hours</div></div>
              <Switch checked={form.OverTime === "Yes"} onCheckedChange={(v) => set("OverTime", v ? "Yes" : "No")} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={() => predict.mutate(form)} disabled={predict.isPending}
              className="gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
              {predict.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Predicting…</> : "Predict Employee"}
            </Button>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key={result.riskLevel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <ResultCard result={result} name={name} />
              </motion.div>
            ) : (
              <GlassCard>
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant"><Gauge className="h-6 w-6" /></div>
                  <div className="mt-4 text-sm font-medium">No prediction yet</div>
                  <p className="mt-1.5 text-xs text-muted-foreground">Fill out the form and click "Predict Employee".</p>
                </div>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function ResultCard({ result, name }: { result: PredictResult; name: string }) {
  const cfg = {
    Low: { color: "text-[color:var(--success)]", bg: "bg-[color:var(--success)]/10", ring: "ring-[color:var(--success)]/30", icon: ShieldCheck, gradient: "from-[#22C55E] to-[#059669]" },
    Medium: { color: "text-[color:var(--warning)]", bg: "bg-[color:var(--warning)]/10", ring: "ring-[color:var(--warning)]/30", icon: AlertTriangle, gradient: "from-[#F59E0B] to-[#EAB308]" },
    High: { color: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30", icon: AlertTriangle, gradient: "from-[#EF4444] to-[#DC2626]" },
  }[result.riskLevel];
  const Icon = cfg.icon;
  const score = Math.round(result.probability * 100);

  return (
    <div className={`overflow-hidden rounded-2xl border ${cfg.ring} ring-1 bg-card p-6 shadow-elegant`}>
      <div className={`-mx-6 -mt-6 mb-5 bg-gradient-to-br ${cfg.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">{name} — {result.prediction}</div>
            <div className="mt-1 text-2xl font-bold">{result.riskLevel} Risk</div>
          </div>
          <Icon className="h-9 w-9" />
        </div>
      </div>
      <div className="space-y-4">
        <Bar label="Attrition Probability" value={score} tone={cfg.color} />
        <Bar label="Confidence" value={Math.round(result.confidence * 100)} tone="" />
        <div className={`rounded-xl ${cfg.bg} p-4`}>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4" /> Top Contributing Factors</div>
          <ul className="space-y-1.5 text-sm">
            {result.topFactors.map((f) => (
              <li key={f.feature} className="flex items-center justify-between gap-2">
                <span className="truncate">{f.feature}</span>
                <span className="font-mono text-xs text-muted-foreground">{f.impact >= 0 ? "+" : ""}{f.impact.toFixed(3)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono font-semibold ${tone}`}>{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}
