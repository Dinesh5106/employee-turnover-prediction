import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserCheck, Sparkles, AlertTriangle, ShieldCheck, Gauge, Lightbulb } from "lucide-react";
import { PageHeader, GlassCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { departments, jobRoles } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/predict")({
  head: () => ({ meta: [{ title: "Employee Prediction — TurnoverAI" }] }),
  component: PredictPage,
});

type Result = {
  risk: "Low" | "Medium" | "High";
  score: number;
  confidence: number;
  recommendations: string[];
};

function PredictPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [form, setForm] = useState({
    name: "Alex Morgan",
    age: 32,
    gender: "Female",
    department: "Engineering",
    role: "Software Engineer",
    income: 85000,
    yearsAtCompany: 4,
    jobSatisfaction: 3,
    envSatisfaction: 3,
    workLifeBalance: 3,
    performance: 4,
    trainingHours: 24,
    overtime: false,
    promotions: 1,
    distance: 12,
    education: "Bachelor's",
    involvement: 3,
    marital: "Single",
    companiesWorked: 2,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const predict = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      // Simple heuristic mock
      let score = 20;
      if (form.overtime) score += 25;
      if (form.jobSatisfaction <= 2) score += 20;
      if (form.workLifeBalance <= 2) score += 15;
      if (form.distance > 20) score += 10;
      if (form.yearsAtCompany < 2) score += 10;
      if (form.income < 50000) score += 8;
      if (form.promotions === 0) score += 8;
      score = Math.min(95, Math.max(5, score));
      const risk: Result["risk"] = score >= 65 ? "High" : score >= 40 ? "Medium" : "Low";
      const recs =
        risk === "High"
          ? [
              "Schedule a 1:1 to understand core concerns",
              "Review compensation and promotion trajectory",
              "Reduce overtime load — redistribute workload",
              "Enroll in mentorship or career development program",
            ]
          : risk === "Medium"
          ? [
              "Check in on workload and satisfaction quarterly",
              "Offer targeted training aligned to career goals",
              "Explore internal mobility opportunities",
            ]
          : [
              "Continue current engagement and recognition",
              "Consider as a mentor for at-risk team members",
              "Reinforce long-term growth conversations",
            ];
      setResult({ risk, score, confidence: 88 + Math.round(Math.random() * 8), recommendations: recs });
      setLoading(false);
    }, 900);
  };

  return (
    <>
      <PageHeader
        title="Employee Prediction"
        description="Enter employee attributes to generate a turnover risk prediction with HR-ready recommendations."
        icon={<UserCheck className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Employee Attributes</h3>
              <p className="text-xs text-muted-foreground">All fields feed into the Random Forest model</p>
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Employee Name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>

            <Field label={`Age — ${form.age}`}>
              <Slider min={18} max={65} step={1} value={[form.age]} onValueChange={(v) => set("age", v[0])} />
            </Field>

            <Field label="Gender">
              <SelectField value={form.gender} onChange={(v) => set("gender", v)} options={["Female", "Male", "Non-binary"]} />
            </Field>

            <Field label="Marital Status">
              <SelectField value={form.marital} onChange={(v) => set("marital", v)} options={["Single", "Married", "Divorced"]} />
            </Field>

            <Field label="Department">
              <SelectField value={form.department} onChange={(v) => set("department", v)} options={departments} />
            </Field>

            <Field label="Job Role">
              <SelectField value={form.role} onChange={(v) => set("role", v)} options={jobRoles} />
            </Field>

            <Field label="Monthly Income (USD)">
              <Input type="number" value={form.income} onChange={(e) => set("income", +e.target.value)} />
            </Field>

            <Field label={`Years at Company — ${form.yearsAtCompany}`}>
              <Slider min={0} max={30} step={1} value={[form.yearsAtCompany]} onValueChange={(v) => set("yearsAtCompany", v[0])} />
            </Field>

            <Field label="Education Level">
              <SelectField value={form.education} onChange={(v) => set("education", v)} options={["High School", "Associate", "Bachelor's", "Master's", "Doctorate"]} />
            </Field>

            <Field label="Number of Companies Worked">
              <Input type="number" value={form.companiesWorked} onChange={(e) => set("companiesWorked", +e.target.value)} />
            </Field>

            <Field label={`Job Satisfaction — ${form.jobSatisfaction}/5`}>
              <Slider min={1} max={5} step={1} value={[form.jobSatisfaction]} onValueChange={(v) => set("jobSatisfaction", v[0])} />
            </Field>

            <Field label={`Environment Satisfaction — ${form.envSatisfaction}/5`}>
              <Slider min={1} max={5} step={1} value={[form.envSatisfaction]} onValueChange={(v) => set("envSatisfaction", v[0])} />
            </Field>

            <Field label={`Work-Life Balance — ${form.workLifeBalance}/5`}>
              <Slider min={1} max={5} step={1} value={[form.workLifeBalance]} onValueChange={(v) => set("workLifeBalance", v[0])} />
            </Field>

            <Field label={`Performance Rating — ${form.performance}/5`}>
              <Slider min={1} max={5} step={1} value={[form.performance]} onValueChange={(v) => set("performance", v[0])} />
            </Field>

            <Field label={`Job Involvement — ${form.involvement}/5`}>
              <Slider min={1} max={5} step={1} value={[form.involvement]} onValueChange={(v) => set("involvement", v[0])} />
            </Field>

            <Field label="Training Hours (last 12 months)">
              <Input type="number" value={form.trainingHours} onChange={(e) => set("trainingHours", +e.target.value)} />
            </Field>

            <Field label="Promotion History (count)">
              <Input type="number" value={form.promotions} onChange={(e) => set("promotions", +e.target.value)} />
            </Field>

            <Field label={`Distance From Home — ${form.distance} km`}>
              <Slider min={0} max={60} step={1} value={[form.distance]} onValueChange={(v) => set("distance", v[0])} />
            </Field>

            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
              <div>
                <div className="text-sm font-medium">Overtime</div>
                <div className="text-xs text-muted-foreground">Regularly works beyond standard hours</div>
              </div>
              <Switch checked={form.overtime} onCheckedChange={(v) => set("overtime", v)} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={predict} disabled={loading}
              className="gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
              {loading ? "Analyzing…" : "Predict Employee Attrition"}
            </Button>
          </div>
        </GlassCard>

        {/* Result */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.risk}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <ResultCard result={result} name={form.name} />
              </motion.div>
            ) : (
              <GlassCard>
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
                    <Gauge className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-sm font-medium">No prediction yet</div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Fill out the form and click "Predict Employee Attrition".
                  </p>
                </div>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function ResultCard({ result, name }: { result: Result; name: string }) {
  const cfg = {
    Low: { color: "text-[color:var(--success)]", bg: "bg-[color:var(--success)]/10", ring: "ring-[color:var(--success)]/30", icon: ShieldCheck, gradient: "from-[#22C55E] to-[#059669]" },
    Medium: { color: "text-[color:var(--warning)]", bg: "bg-[color:var(--warning)]/10", ring: "ring-[color:var(--warning)]/30", icon: AlertTriangle, gradient: "from-[#F59E0B] to-[#EAB308]" },
    High: { color: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30", icon: AlertTriangle, gradient: "from-[#EF4444] to-[#DC2626]" },
  }[result.risk];
  const Icon = cfg.icon;

  return (
    <div className={`overflow-hidden rounded-2xl border ${cfg.ring} ring-1 bg-card p-6 shadow-elegant`}>
      <div className={`-mx-6 -mt-6 mb-5 bg-gradient-to-br ${cfg.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80">Prediction for {name}</div>
            <div className="mt-1 text-2xl font-bold">{result.risk} Risk</div>
          </div>
          <Icon className="h-9 w-9" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Attrition Risk Score</span>
            <span className={`font-mono font-semibold ${cfg.color}`}>{result.score}%</span>
          </div>
          <Progress value={result.score} className="h-2" />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Model Confidence</span>
            <span className="font-mono font-semibold">{result.confidence}%</span>
          </div>
          <Progress value={result.confidence} className="h-2" />
        </div>

        <div className={`rounded-xl ${cfg.bg} p-4`}>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4" /> HR Recommendations
          </div>
          <ul className="space-y-1.5 text-sm">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );
}
