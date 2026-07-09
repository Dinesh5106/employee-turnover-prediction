import { motion } from "motion/react";
import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title, description, icon, action,
}: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
      </motion.div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function GlassCard({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "glass rounded-2xl p-6 shadow-card transition-all hover:shadow-elegant hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function tooltipStyle(): CSSProperties {
  return {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "var(--shadow-card)",
    color: "var(--color-popover-foreground)",
  };
}

export function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    Low: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    Medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    High: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[risk] ?? ""}`}>
      {risk}
    </span>
  );
}
