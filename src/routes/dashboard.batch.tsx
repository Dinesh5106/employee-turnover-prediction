import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { Users, Upload, Download, Loader2 } from "lucide-react";
import { PageHeader, GlassCard, RiskBadge } from "@/components/dashboard/shared";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBatchPredict, useModelInfo } from "@/hooks/use-api";

export const Route = createFileRoute("/dashboard/batch")({
  head: () => ({ meta: [{ title: "Batch Prediction — TurnoverAI" }] }),
  component: Batch,
});

function Batch() {
  const info = useModelInfo();
  const batch = useBatchPredict();
  const inputRef = useRef<HTMLInputElement>(null);

  if (info.isLoading) return <div className="flex items-center py-24 justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading…</div>;
  if (!info.data?.hasModel) {
    return <><PageHeader title="Batch Prediction" icon={<Users className="h-5 w-5"/>}/>
      <EmptyState title="No trained model" message="Train a model before running batch predictions." cta={{ to: "/dashboard/train", label: "Train model" }} /></>;
  }

  const downloadCsv = () => {
    if (!batch.data) return;
    const rows = [
      ["EmployeeID", "Prediction", "Probability", "RiskScore", "RiskLevel"],
      ...batch.data.predictions.map((r) => [r.employeeId, r.prediction, r.probability, r.riskScore, r.riskLevel]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "predictions.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Batch Prediction" description="Upload a CSV of employees to score in bulk." icon={<Users className="h-5 w-5" />} />

      <GlassCard>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={inputRef} type="file" accept=".csv" hidden onChange={(e) => e.target.files?.[0] && batch.mutate(e.target.files[0])} />
          <Button onClick={() => inputRef.current?.click()} disabled={batch.isPending}>
            {batch.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Scoring…</> : <><Upload className="mr-2 h-4 w-4"/>Upload CSV</>}
          </Button>
          {batch.data && (
            <>
              <span className="text-sm text-muted-foreground">{batch.data.count} predictions ready</span>
              <Button variant="outline" onClick={downloadCsv} className="ml-auto"><Download className="mr-2 h-4 w-4"/>Download CSV</Button>
            </>
          )}
        </div>
      </GlassCard>

      {batch.data && (
        <GlassCard className="mt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead className="text-right">Probability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batch.data.predictions.map((r) => (
                  <TableRow key={r.employeeId}>
                    <TableCell className="font-mono text-xs">{r.employeeId}</TableCell>
                    <TableCell>{r.prediction}</TableCell>
                    <TableCell><RiskBadge risk={r.riskLevel} /></TableCell>
                    <TableCell className="text-right font-mono text-xs">{r.riskScore}%</TableCell>
                    <TableCell className="text-right font-mono text-xs">{r.probability.toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      )}
    </>
  );
}
