import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Search, ChevronRight, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  predict: "Employee Prediction",
  analytics: "Analytics",
  performance: "Model Performance",
  explainable: "Explainable AI",
  mlops: "MLOps Monitor",
  about: "About",
};

function DashboardLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const parts = pathname.split("/").filter(Boolean);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border glass-strong px-4 sm:px-6">
            <SidebarTrigger />
            <nav className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <Link to="/" className="flex items-center gap-1.5 hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
              </Link>
              {parts.map((p, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className={i === parts.length - 1 ? "font-medium text-foreground" : ""}>
                    {labels[p] ?? p}
                  </span>
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search employees…" className="h-9 w-64 rounded-full bg-muted/50 pl-9" />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-[1.15rem] w-[1.15rem]" />
              </Button>
              <ThemeToggle />
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">HR</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
