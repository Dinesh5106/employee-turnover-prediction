import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Users, AlertTriangle, ShieldCheck, Target, TrendingUp, TrendingDown, LayoutDashboard,
  ArrowRight, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, AreaChart, Area, Legend,
} from "recharts";
import { GlassCard, PageHeader, tooltipStyle } from "@/components/dashboard/shared";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { useDashboard, useAnalytics } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — TurnoverAI" }] }),
  component: DashboardIndex,
});

const PIE_COLORS = ["#2563EB", "#7C3AED", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

function DashboardIndex() {
  const dash = useDashboard();
  const analytics = useAnalytics();

  if (dash.isLoading) return <Loader />;
  if (dash.isError) return <ErrorState message={(dash.error as Error).message} />;
  if (!dash.data?.hasDataset) {
    return (
      <>
        <PageHeader title="Workforce Overview" icon={<LayoutDashboard className="h-5 w-5" />} />
        <EmptyState />
      </>
    );
  }

  const d = dash.data;
  const cards = [
    { label: "Total Employees", value: d.totalEmployees?.toLocaleString() ?? "—",
      icon: Users, color: "from-[#2563EB] to-[#7C3AED]" },
    { label: "Employees at Risk", value: d.atRisk?.toString() ?? "—",
      icon: AlertTriangle, color: "from-[#EF4444] to-[#F59E0B]" },
    { label: "Retention Rate", value: d.retentionRate != null ? `${d.retentionRate}%` : "—",
      icon: ShieldCheck, color: "from-[#22C55E] to-[#059669]" },
    { label: "Model Accuracy", value: d.accuracy != null ? `${d.accuracy}%` : "—",
      icon: Target, color: "from-[#7C3AED] to-[#2563EB]" },
  ];

  return (
    <>
      <PageHeader
        title="Workforce Overview"
        description={d.hasModel ? "Live KPIs computed from your uploaded dataset and trained model."
          : "Dataset loaded. Train a model to unlock predictions and accuracy metrics."}
        icon={<LayoutDashboard className="h-5 w-5" />}
        action={!d.hasModel ? (
          <Link to="/dashboard/train" className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant">
            Train model <ArrowRight className="h-4 w-4" />
          </Link>
        ) : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${c.color} opacity-15 blur-2xl`} />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="mt-2 text-3xl font-bold tracking-tight">{c.value}</div>
              </div>
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-elegant`}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {analytics.data && (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <GlassCard delay={0.1}>
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Employee Distribution</h3>
                <p className="text-xs text-muted-foreground">By department</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={analytics.data.employeeDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {analytics.data.employeeDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle()} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="lg:col-span-2" delay={0.15}>
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Department-wise Attrition</h3>
                <p className="text-xs text-muted-foreground">Retained vs churned</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={analytics.data.departments} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={tooltipStyle()} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                    <Bar dataKey="retained" stackId="a" fill="#2563EB" />
                    <Bar dataKey="attrition" stackId="a" fill="#EF4444" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <GlassCard delay={0.2}>
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Salary Distribution</h3>
                <p className="text-xs text-muted-foreground">Employees by monthly income band</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={analytics.data.salary}>
                    <defs>
                      <linearGradient id="salaryG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={tooltipStyle()} />
                    <Bar dataKey="count" fill="url(#salaryG)" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard delay={0.25}>
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Tenure Attrition Trend</h3>
                <p className="text-xs text-muted-foreground">Attrition vs retained by years at company</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={analytics.data.trend}>
                    <defs>
                      <linearGradient id="attG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="hireG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={tooltipStyle()} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                    <Area type="monotone" dataKey="hires" stroke="#22C55E" strokeWidth={2} fill="url(#hireG)" />
                    <Area type="monotone" dataKey="attrition" stroke="#EF4444" strokeWidth={2} fill="url(#attG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-24 text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading dashboard…
    </div>
  );
}

// Re-export for backward compat with pages that imported from here
export { tooltipStyle };
