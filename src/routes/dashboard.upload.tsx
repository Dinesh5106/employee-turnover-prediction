import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, ArrowRight, Loader2, Search } from "lucide-react";
import { PageHeader, GlassCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useUpload, useProcess } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: "Dataset Upload — TurnoverAI" }] }),
  component: UploadPage,
});

function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const upload = useUpload();
  const process = useProcess();

  const handleFile = async (file: File) => {
    setProgress(10);
    const timer = setInterval(() => setProgress((p) => (p < 85 ? p + 7 : p)), 120);
    try {
      await upload.mutateAsync(file);
      setProgress(100);
    } finally {
      clearInterval(timer);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const info = upload.data?.info;
  const validation = upload.data?.validation ?? [];
  const allValid = validation.length > 0 && validation.every((v) => v.passed);

  return (
    <>
      <PageHeader title="Dataset Upload" description="Upload an Employee Turnover CSV to validate, preview, and process." icon={<Upload className="h-5 w-5" />} />

      <GlassCard>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          className="flex flex-col items-center rounded-xl border-2 border-dashed border-border p-10 text-center transition-colors hover:border-primary/60"
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Drop your CSV here or click to browse</h3>
          <p className="mt-1 text-sm text-muted-foreground">Standard IBM HR Attrition schema works out of the box.</p>
          <input ref={inputRef} type="file" accept=".csv" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Button className="mt-4" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Uploading…</> : "Choose CSV file"}
          </Button>
          {progress > 0 && <div className="mt-4 w-full max-w-md"><Progress value={progress} className="h-2" /></div>}
        </div>
      </GlassCard>

      {info && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Rows" value={info.rows.toLocaleString()} />
            <Stat label="Columns" value={info.columns.toString()} />
            <Stat label="Missing Values" value={info.missingValues.toLocaleString()} />
            <Stat label="Duplicate Rows" value={info.duplicateRows.toLocaleString()} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <h3 className="mb-4 text-sm font-semibold">Data Validation</h3>
              <ul className="space-y-2 text-sm">
                {validation.map((v) => (
                  <li key={v.name} className="flex items-start gap-2">
                    {v.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--success)]"/> : <XCircle className="mt-0.5 h-4 w-4 text-destructive"/>}
                    <div><div className="font-medium">{v.name}</div><div className="text-xs text-muted-foreground">{v.detail}</div></div>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard>
              <h3 className="mb-4 text-sm font-semibold">Column Types</h3>
              <div className="max-h-64 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader><TableRow><TableHead>Column</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {Object.entries(info.dtypes).map(([c, t]) => (
                      <TableRow key={c}><TableCell className="font-mono text-xs">{c}</TableCell><TableCell className="text-xs text-muted-foreground">{t}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </div>

          <DataPreview />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <a href={api.downloadDatasetUrl()} className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
              <Download className="h-4 w-4" /> Download dataset
            </a>
            <div className="flex gap-2">
              <Button disabled={!allValid || process.isPending} onClick={() => process.mutate()}
                className="gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
                {process.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Processing…</> : "Process Dataset"}
              </Button>
              {process.data && (
                <Button variant="outline" asChild><Link to="/dashboard/train">Continue to training <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
              )}
            </div>
          </div>

          {process.data && (
            <GlassCard className="mt-6">
              <h3 className="mb-4 text-sm font-semibold">Preprocessing Steps</h3>
              <ul className="space-y-2 text-sm">
                {process.data.steps.map((s) => (
                  <li key={s.name} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--success)]"/>
                    <div><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.detail}</div></div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <GlassCard><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></GlassCard>;
}

function DataPreview() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string | undefined>();
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [filterCol, setFilterCol] = useState("");
  const [filterVal, setFilterVal] = useState("");

  const q = useQuery({
    queryKey: ["preview", page, search, sort, dir, filterCol, filterVal],
    queryFn: () => api.previewDataset({ page, limit: 10, search, sort, direction: dir, filter_col: filterCol, filter_val: filterVal }),
  });

  return (
    <GlassCard className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-sm font-semibold">Data Preview</h3>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input placeholder="Search…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-9 w-48 pl-8"/>
        </div>
        <Input placeholder="Filter column" value={filterCol} onChange={(e) => setFilterCol(e.target.value)} className="h-9 w-36" />
        <Input placeholder="Filter value" value={filterVal} onChange={(e) => { setFilterVal(e.target.value); setPage(1); }} className="h-9 w-36" />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {q.data?.columns.map((c) => (
                <TableHead key={c} onClick={() => { setSort(c); setDir((d) => d === "asc" ? "desc" : "asc"); }} className="cursor-pointer select-none whitespace-nowrap">
                  {c}{sort === c ? (dir === "asc" ? " ↑" : " ↓") : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.data?.rows.map((r, i) => (
              <TableRow key={i}>
                {q.data.columns.map((c) => <TableCell key={c} className="whitespace-nowrap text-xs">{String(r[c] ?? "")}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Page {page} · {q.data?.total ?? 0} rows</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!q.data || page * 10 >= q.data.total}>Next</Button>
        </div>
      </div>
    </GlassCard>
  );
}
