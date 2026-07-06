import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Users, AlertTriangle, ShieldCheck, Target, TrendingUp, TrendingDown, LayoutDashboard,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  topCards, employeeDistribution, departmentAttrition, salaryDistribution,
  monthlyTrend, recentPredictions,
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — TurnoverAI" }] }),
  component: DashboardIndex,
});

const chartColors = ["hsl(var(--chart-1))"]; // placeholder — we'll use CSS vars directly
const PIE_COLORS = ["#2563EB", "#7C3AED", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

const cards = [
  { label: "Total Employees", value: topCards.totalEmployees.toLocaleString(), delta: "+3.2%", up: true, icon: Users, color: "from-[#2563EB] to-[#7C3AED]" },
  { label: "Employees at Risk", value: topCards.atRisk.toString(), delta: "+12", up: false, icon: AlertTriangle, color: "from-[#EF4444] to-[#F59E0B]" },
  { label: "Retention Rate", value: `${topCards.retentionRate}%`, delta: "+1.4%", up: true, icon: ShieldCheck, color: "from-[#22C55E] to-[#059669]" },
  { label: "Prediction Accuracy", value: `${topCards.accuracy}%`, delta: "+0.6%", up: true, icon: Target, color: "from-[#7C3AED] to-[#2563EB]" },
];

function DashboardIndex() {
  return (
    <>
      <PageHeader
        title="Workforce Overview"
        description="Real-time KPIs, distributions, and attrition trends across your organization."
        icon={<LayoutDashboard className="h-5 w-5" />}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${c.color} opacity-15 blur-2xl transition-opacity group-hover:opacity-30`} />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="mt-2 text-3xl font-bold tracking-tight">{c.value}</div>
                <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${c.up ? "text-[color:var(--success)]" : "text-destructive"}`}>
                  {c.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {c.delta} vs last month
                </div>
              </div>
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-elegant`}>
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1" delay={0.1}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Employee Distribution</h3>
            <p className="text-xs text-muted-foreground">By department</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={employeeDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {employeeDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" delay={0.15}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Department-wise Attrition</h3>
              <p className="text-xs text-muted-foreground">Retained vs churned by team</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={departmentAttrition} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="retained" stackId="a" fill="#2563EB" radius={[0,0,0,0]} />
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
            <p className="text-xs text-muted-foreground">Employees by annual salary band</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={salaryDistribution}>
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
            <h3 className="text-sm font-semibold">Monthly Attrition Trend</h3>
            <p className="text-xs text-muted-foreground">Attrition vs new hires (last 12 months)</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={monthlyTrend}>
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

      {/* Recent Predictions */}
      <GlassCard className="mt-6" delay={0.3}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Recent Predictions</h3>
            <p className="text-xs text-muted-foreground">Latest model outputs across your organization</p>
          </div>
          <Badge variant="outline" className="text-xs">Live</Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPredictions.map((r) => (
                <TableRow key={r.name} className="hover:bg-muted/40">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.dept}</TableCell>
                  <TableCell><RiskBadge risk={r.risk} /></TableCell>
                  <TableCell className="text-sm">{r.pred}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{r.score}%</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlassCard>
    </>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    Low: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    Medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    High: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[risk]}`}>
      {risk}
    </span>
  );
}

export function tooltipStyle(): React.CSSProperties {
  return {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "var(--shadow-card)",
    color: "var(--color-popover-foreground)",
  };
}
