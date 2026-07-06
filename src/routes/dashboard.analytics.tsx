import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/dashboard/shared";
import { tooltipStyle } from "./dashboard.index";
import {
  departmentAttrition, ageDistribution, salaryVsAttrition, overtimeData,
  satisfactionData, performanceData, workLifeBalance,
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TurnoverAI" }] }),
  component: AnalyticsPage,
});

const PIE = ["#22C55E", "#7C3AED", "#2563EB", "#F59E0B"];

function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Workforce Analytics"
        description="Interactive dashboards exploring the drivers behind employee turnover."
        icon={<BarChart3 className="h-5 w-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <ChartHeader title="Department-wise Attrition" sub="Retained vs churned by team" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={departmentAttrition} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false}/>
                <YAxis tick={axisTick} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="retained" fill="#2563EB" radius={[6,6,0,0]} />
                <Bar dataKey="attrition" fill="#EF4444" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <ChartHeader title="Age Distribution" sub="Employees across age bands" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={ageDistribution}>
                <defs>
                  <linearGradient id="ageG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="age" tick={axisTick} axisLine={false} tickLine={false}/>
                <YAxis tick={axisTick} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="count" fill="url(#ageG)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.1}>
          <ChartHeader title="Salary vs Tenure" sub="Attrition markers overlaid" />
          <div className="h-64">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" dataKey="salary" name="Salary (k)" tick={axisTick} axisLine={false} tickLine={false}/>
                <YAxis type="number" dataKey="tenure" name="Tenure (yrs)" tick={axisTick} axisLine={false} tickLine={false}/>
                <ZAxis range={[40, 120]} />
                <Tooltip contentStyle={tooltipStyle()} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={salaryVsAttrition.filter(d=>!d.attrition)} fill="#2563EB" name="Retained"/>
                <Scatter data={salaryVsAttrition.filter(d=>d.attrition)} fill="#EF4444" name="Attrition"/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <ChartHeader title="Overtime Analysis" sub="Impact of overtime on retention" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={overtimeData} layout="vertical" barSize={30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false}/>
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={110}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="retained" stackId="a" fill="#2563EB" radius={[0,0,0,0]} />
                <Bar dataKey="attrition" stackId="a" fill="#EF4444" radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <ChartHeader title="Job Satisfaction Analysis" sub="Attrition rate by satisfaction level" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="level" tick={axisTick} axisLine={false} tickLine={false}/>
                <YAxis tick={axisTick} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
                <Line type="monotone" dataKey="attritionRate" stroke="#EF4444" strokeWidth={3} dot={{ r: 5, fill: "#EF4444" }} name="Attrition Rate %" />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} dot={{ r: 5, fill: "#2563EB" }} name="Employees"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.25}>
          <ChartHeader title="Promotion Analysis" sub="Time-since-promotion vs risk (radar)" />
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={[
                { metric: "0-1y", value: 82 },
                { metric: "1-2y", value: 65 },
                { metric: "2-3y", value: 48 },
                { metric: "3-5y", value: 62 },
                { metric: "5y+", value: 78 },
              ]}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" tick={axisTick}/>
                <PolarRadiusAxis tick={axisTick}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Radar name="Retention Score" dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.35} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <ChartHeader title="Work-Life Balance" sub="Distribution across the workforce" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={workLifeBalance} dataKey="value" nameKey="level" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {workLifeBalance.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.35}>
          <ChartHeader title="Performance Rating Distribution" sub="Rating 1 (low) to 5 (top)" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={performanceData}>
                <defs>
                  <linearGradient id="perfG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="rating" tick={axisTick} axisLine={false} tickLine={false}/>
                <YAxis tick={axisTick} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="count" fill="url(#perfG)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

const axisTick = { fontSize: 11, fill: "var(--color-muted-foreground)" };

function ChartHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
