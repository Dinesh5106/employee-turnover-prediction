import { createFileRoute } from "@tanstack/react-router";
import { Info, Target, Layers, Cpu, TrendingUp, Rocket, Users } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/about")({
  head: () => ({ meta: [{ title: "About — TurnoverAI" }] }),
  component: About,
});

const stack = [
  "React 19", "TypeScript", "TanStack Start", "Tailwind CSS v4", "shadcn/ui",
  "Motion", "Recharts", "React Hook Form", "Zod", "Python", "scikit-learn",
  "Random Forest", "SHAP", "MLflow", "Docker", "GitHub Actions",
];

const objectives = [
  "Reduce voluntary employee attrition through early intervention",
  "Provide HR teams with explainable, actionable risk signals",
  "Deliver a production-ready ML system with modern MLOps practices",
  "Democratize workforce analytics across departments",
];

const benefits = [
  { icon: TrendingUp, title: "Higher Retention", desc: "Identify at-risk employees before they leave." },
  { icon: Target, title: "Data-Driven HR", desc: "Move from gut feel to evidence-based decisions." },
  { icon: Rocket, title: "Faster Response", desc: "Real-time predictions enable timely intervention." },
  { icon: Layers, title: "Explainable", desc: "SHAP explanations build trust with stakeholders." },
];

function About() {
  return (
    <>
      <PageHeader
        title="About the Project"
        description="Employee Turnover Prediction System — an end-to-end ML platform for modern HR teams."
        icon={<Info className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-semibold">Project Overview</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            TurnoverAI is a full-stack machine learning platform that predicts employee attrition
            using a Random Forest classifier trained on IBM HR analytics data. It combines
            interactive dashboards, per-employee risk scoring, SHAP-based explainability, and a
            complete MLOps pipeline with MLflow tracking, Dockerized deployment, and CI/CD.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The goal: give HR leaders the tools to move from reactive exit interviews to
            proactive retention programs — grounded in transparent, explainable predictions.
          </p>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="text-sm font-semibold">Machine Learning</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary"/> Random Forest Classifier</li>
            <li className="flex gap-2"><Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary"/> Gradient Boosting (baseline)</li>
            <li className="flex gap-2"><Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary"/> Logistic Regression (baseline)</li>
            <li className="flex gap-2"><Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary"/> SHAP for explainability</li>
            <li className="flex gap-2"><Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary"/> SMOTE for class balance</li>
          </ul>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="text-sm font-semibold">Objectives</h3>
          <ul className="mt-4 space-y-3">
            {objectives.map((o) => (
              <li key={o} className="flex gap-3 text-sm">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full gradient-primary" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="text-sm font-semibold">Technology Stack</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {stack.map((t) => (
              <Badge key={t} variant="outline" className="rounded-full text-xs">{t}</Badge>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b, i) => (
          <GlassCard key={b.title} delay={i * 0.04}>
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
              <b.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-sm font-semibold">{b.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="text-sm font-semibold">Future Scope</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Deep learning models (TabNet, Neural Networks) for improved accuracy</li>
            <li>• Real-time streaming predictions via Kafka + FastAPI</li>
            <li>• Integrated survey tools for engagement signal collection</li>
            <li>• Automated retention playbooks and manager notifications</li>
            <li>• Multi-tenant SaaS with role-based access controls</li>
          </ul>
        </GlassCard>

        <GlassCard delay={0.05}>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Team & Guide</h3>
              <p className="text-xs text-muted-foreground">Built with care for HR practitioners</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { name: "Team Member 1", role: "ML Engineer" },
              { name: "Team Member 2", role: "Frontend Dev" },
              { name: "Team Member 3", role: "Data Scientist" },
              { name: "Project Guide", role: "Faculty Advisor" },
            ].map((m) => (
              <div key={m.name} className="rounded-xl border bg-muted/30 p-3">
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.role}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );
}
