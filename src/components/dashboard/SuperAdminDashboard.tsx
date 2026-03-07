import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KpiCards } from "./KpiCards";
import { RevenueChart } from "./RevenueChart";
import { DealsPipeline } from "./DealsPipeline";
import { PipelineMetrics } from "./PipelineMetrics";
import { TasksOverview } from "./TasksOverview";
import { RecentActivity } from "./RecentActivity";
import { Shield, Users, Crown, ShieldCheck, User, AlertTriangle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SuperAdminDashboard() {
  const { data: contacts } = useQuery({
    queryKey: ["sa-contacts-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: leads } = useQuery({
    queryKey: ["sa-leads-count"],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("converted", false);
      return count ?? 0;
    },
  });
  const { data: deals } = useQuery({
    queryKey: ["sa-deals-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("amount, stage");
      return { total: data?.reduce((s, d) => s + (d.amount || 0), 0) ?? 0, count: data?.length ?? 0 };
    },
  });
  const { data: calls } = useQuery({
    queryKey: ["sa-calls-count"],
    queryFn: async () => {
      const { count } = await supabase.from("calls").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: tasks } = useQuery({
    queryKey: ["sa-tasks-count"],
    queryFn: async () => {
      const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Completed");
      return count ?? 0;
    },
  });
  const { data: userRoles } = useQuery({
    queryKey: ["sa-user-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role");
      return data ?? [];
    },
  });
  const { data: auditLogs } = useQuery({
    queryKey: ["sa-recent-audit"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_trail").select("*").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const roleCounts = {
    super_admin: userRoles?.filter(r => r.role === "super_admin").length ?? 0,
    admin: userRoles?.filter(r => r.role === "admin").length ?? 0,
    manager: userRoles?.filter(r => r.role === "manager").length ?? 0,
    employee: userRoles?.filter(r => r.role === "employee").length ?? 0,
  };

  const roleConfig = [
    { role: "super_admin", label: "Super Admins", icon: Crown, color: "text-destructive", bg: "bg-destructive/10" },
    { role: "admin", label: "Admins", icon: Shield, color: "text-primary", bg: "bg-primary/10" },
    { role: "manager", label: "Managers", icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
    { role: "employee", label: "Employees", icon: User, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-6">
      {/* System Banner */}
      <div className="bg-gradient-to-r from-destructive/10 via-primary/5 to-accent/10 rounded-xl p-4 border border-destructive/20">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-destructive" />
          <div>
            <h2 className="font-display font-bold text-foreground">Super Admin Control Center</h2>
            <p className="text-sm text-muted-foreground">Full system overview — all users, all data, all modules</p>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roleConfig.map(rc => (
          <div key={rc.role} className="crm-kpi-card">
            <div className={`${rc.bg} p-2 rounded-lg w-fit mb-3`}>
              <rc.icon className={`w-5 h-5 ${rc.color}`} />
            </div>
            <div className="text-2xl font-display font-bold text-foreground">{roleCounts[rc.role as keyof typeof roleCounts]}</div>
            <div className="text-sm text-muted-foreground">{rc.label}</div>
          </div>
        ))}
      </div>

      {/* CRM KPIs */}
      <KpiCards contactsCount={contacts ?? 0} leadsCount={leads ?? 0} dealsTotal={deals?.total ?? 0} dealsCount={deals?.count ?? 0} callsCount={calls ?? 0} tasksCount={tasks ?? 0} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RevenueChart /></div>
        <div><DealsPipeline /></div>
      </div>

      {/* Audit + Metrics + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-5 crm-shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Recent Audit Logs</h3>
          </div>
          {auditLogs?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit logs yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs?.map(log => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{log.action}</span>
                    <span className="text-muted-foreground"> in {log.module}</span>
                    <div className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div><TasksOverview /></div>
        <div><RecentActivity /></div>
      </div>
    </div>
  );
}
