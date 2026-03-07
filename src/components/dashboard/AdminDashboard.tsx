import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KpiCards } from "./KpiCards";
import { RevenueChart } from "./RevenueChart";
import { DealsPipeline } from "./DealsPipeline";
import { PipelineMetrics } from "./PipelineMetrics";
import { TasksOverview } from "./TasksOverview";
import { RecentActivity } from "./RecentActivity";
import { Shield, Users } from "lucide-react";

export function AdminDashboard() {
  const { data: contacts } = useQuery({
    queryKey: ["admin-contacts-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: leads } = useQuery({
    queryKey: ["admin-leads-count"],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("converted", false);
      return count ?? 0;
    },
  });
  const { data: deals } = useQuery({
    queryKey: ["admin-deals-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("amount, stage");
      return { total: data?.reduce((s, d) => s + (d.amount || 0), 0) ?? 0, count: data?.length ?? 0 };
    },
  });
  const { data: calls } = useQuery({
    queryKey: ["admin-calls-count"],
    queryFn: async () => {
      const { count } = await supabase.from("calls").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: tasks } = useQuery({
    queryKey: ["admin-tasks-count"],
    queryFn: async () => {
      const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Completed");
      return count ?? 0;
    },
  });
  const { data: teamSize } = useQuery({
    queryKey: ["admin-team-size"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h2 className="font-display font-bold text-foreground">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">Organization-wide CRM overview — manage teams and monitor performance</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-card rounded-lg px-3 py-2 crm-shadow-card">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{teamSize} team members</span>
          </div>
        </div>
      </div>

      <KpiCards contactsCount={contacts ?? 0} leadsCount={leads ?? 0} dealsTotal={deals?.total ?? 0} dealsCount={deals?.count ?? 0} callsCount={calls ?? 0} tasksCount={tasks ?? 0} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RevenueChart /></div>
        <div><DealsPipeline /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div><PipelineMetrics /></div>
        <div><TasksOverview /></div>
        <div><RecentActivity /></div>
      </div>
    </div>
  );
}
