import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Loader2 } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { GlassCard, PageHeader, tooltipStyle } from "@/components/dashboard/shared";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { useAnalytics } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TurnoverAI" }] }),
  component: Analytics,
});

const PIE = ["#2563EB", "#7C3AED", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

function Analytics() {
  const q = useAnalytics();
  if (q.isLoading) return <div className="flex items-center py-24 justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading analytics…</div>;
  if (q.isError) {
    const msg = (q.error as Error).message;
    if (msg.toLowerCase().includes("no dataset")) return <><PageHeader title="Analytics" icon={<BarChart3 className="h-5 w-5"/>}/><EmptyState /></>;
    return <ErrorState message={msg} />;
  }
  const a = q.data!;
  return (
    <>
      <PageHeader title="Analytics" description="Live distributions and attrition breakdowns from your dataset." icon={<BarChart3 className="h-5 w-5" />} />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-sm font-semibold">Age Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={a.age}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="age" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="count" fill="#7C3AED" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold">Gender Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={a.gender} dataKey="value" nameKey="name" outerRadius={90} label>
                  {a.gender.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold">Job Satisfaction vs Attrition</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={a.satisfaction}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="l" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                <Bar yAxisId="l" dataKey="count" fill="#2563EB" radius={[6,6,0,0]} name="Employees"/>
                <Bar yAxisId="r" dataKey="attritionRate" fill="#EF4444" radius={[6,6,0,0]} name="Attrition %"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold">Overtime Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={a.overtime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="retained" stackId="a" fill="#22C55E" />
                <Bar dataKey="attrition" stackId="a" fill="#EF4444" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {a.featureImportance.length > 0 && (
          <GlassCard delay={0.2} className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold">Feature Importance Radar</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <RadarChart data={a.featureImportance.slice(0, 8)}>
                  <PolarGrid stroke="var(--color-border)"/>
                  <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}/>
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}/>
                  <Radar dataKey="importance" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.35}/>
                  <Tooltip contentStyle={tooltipStyle()} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}
      </div>
    </>
  );
}
