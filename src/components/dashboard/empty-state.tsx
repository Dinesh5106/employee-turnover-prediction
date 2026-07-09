import { Link } from "@tanstack/react-router";
import { Database, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function EmptyState({
  title = "No dataset uploaded",
  message = "Upload an Employee Turnover CSV to begin. Every chart, KPI, and prediction on this page updates automatically after processing and training.",
  cta = { to: "/dashboard/upload", label: "Upload dataset" },
  icon,
}: {
  title?: string;
  message?: string;
  cta?: { to: string; label: string } | null;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass mx-auto flex max-w-2xl flex-col items-center rounded-2xl p-10 text-center shadow-card"
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
        {icon ?? <Database className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-6 inline-flex items-center gap-2 rounded-lg gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
        >
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass rounded-2xl p-6 text-sm text-destructive shadow-card">
      Unable to reach the backend: {message}. Make sure the FastAPI server is running
      and <code className="font-mono text-xs">VITE_API_URL</code> points to it.
    </div>
  );
}
