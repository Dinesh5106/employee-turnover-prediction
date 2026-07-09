import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Users, TrendingDown, LayoutDashboard, Sparkles, GitBranch, Activity,
  ArrowRight, PlayCircle, Github, FileText, Mail, Info, Sparkle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const landingStats = [
  { label: "Explainable", value: "SHAP" },
  { label: "Real-time", value: "APIs" },
  { label: "Model Registry", value: "MLOps" },
  { label: "Open Source", value: "FastAPI" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TurnoverAI — Predict Employee Attrition with AI" },
      { name: "description", content: "Predict employee attrition using AI and ML. Explainable predictions, live HR dashboards, and end-to-end MLOps for modern people teams." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Employee Analytics", desc: "Deep workforce insights across departments, tenure, and satisfaction." },
  { icon: TrendingDown, title: "Attrition Prediction", desc: "Individual-level turnover risk scoring powered by Random Forest." },
  { icon: LayoutDashboard, title: "HR Dashboard", desc: "Real-time KPIs, filters, and drill-downs your HR team will love." },
  { icon: Sparkles, title: "Explainable AI", desc: "SHAP-based feature attributions for every single prediction." },
  { icon: GitBranch, title: "MLOps Pipeline", desc: "MLflow tracking, Docker deploys, CI/CD, and model registry." },
  { icon: Activity, title: "Model Monitoring", desc: "Live drift detection, prediction throughput, and health metrics." },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-base font-bold tracking-tight">TurnoverAI</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground">Metrics</a>
            <a href="#footer" className="text-sm text-muted-foreground hover:text-foreground">Docs</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
              <Link to="/dashboard">Launch App</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center pt-16">
        <div className="absolute inset-0 -z-10 gradient-hero animate-gradient opacity-90 dark:opacity-70" />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl animate-float-slow" />
          <div className="absolute right-[15%] top-[10%] h-80 w-80 rounded-full bg-secondary/40 blur-3xl animate-float" />
          <div className="absolute bottom-[15%] left-[35%] h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-float-slow" />
        </div>
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

        <div className="mx-auto max-w-5xl px-4 py-24 text-center text-white sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur"
          >
            <Sparkle className="h-3.5 w-3.5" />
            AI-powered workforce intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Employee Turnover<br />Prediction System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base text-white/85 sm:text-lg"
          >
            Predict employee attrition using Artificial Intelligence and Machine Learning
            to improve employee retention and workforce management.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow">
              <Link to="/dashboard">Get Started <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
              <Link to="/dashboard/predict"><PlayCircle className="mr-1.5 h-4 w-4" /> Live Demo</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <a href="#features">Learn More</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border bg-muted/30 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4">
          {landingStats.map((s: { label: string; value: string }, i: number) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass rounded-2xl p-6 text-center shadow-card"
            >
              <div className="gradient-text text-3xl font-bold sm:text-4xl">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Platform</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Everything HR needs to retain talent</h2>
            <p className="mt-4 text-muted-foreground">
              An end-to-end platform combining machine learning, explainability, and modern MLOps.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elegant"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full gradient-primary opacity-10 blur-2xl transition-opacity group-hover:opacity-30" />
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 text-center text-white shadow-elegant sm:p-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to reduce attrition?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Explore live dashboards, try the prediction engine, and see explainable AI in action.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/dashboard">Open Dashboard <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link to="/dashboard/predict">Try Live Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold">TurnoverAI</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Predictive workforce analytics for modern HR teams.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
            { icon: PlayCircle, label: "Live Demo", to: "/dashboard/predict" },
            { icon: Activity, label: "Model Performance", to: "/dashboard/performance" },
          ]}/>
          <FooterCol title="Resources" links={[
            { icon: FileText, label: "Documentation", href: "#" },
            { icon: Github, label: "GitHub", href: "#" },
            { icon: Info, label: "About Project", to: "/dashboard/about" },
          ]}/>
          <FooterCol title="Company" links={[
            { icon: Info, label: "About", to: "/dashboard/about" },
            { icon: Mail, label: "Contact", href: "#" },
          ]}/>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-border px-4 pt-6 text-center text-xs text-muted-foreground sm:px-6">
          © 2026 TurnoverAI. Built with modern ML and love for HR teams.
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: {
  title: string;
  links: Array<{ icon: any; label: string; to?: string; href?: string }>;
}) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <l.icon className="h-3.5 w-3.5" /> {l.label}
              </Link>
            ) : (
              <a href={l.href} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <l.icon className="h-3.5 w-3.5" /> {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
