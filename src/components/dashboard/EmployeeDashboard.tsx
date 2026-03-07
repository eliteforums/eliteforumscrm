import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { KpiCards } from "./KpiCards";
import { DealsPipeline } from "./DealsPipeline";
import { TasksOverview } from "./TasksOverview";
import { RecentActivity } from "./RecentActivity";
import { User, Briefcase } from "lucide-react";

export function EmployeeDashboard() {
  const { user } = useAuth();

  const { data: contacts } = useQuery({
    queryKey: ["emp-contacts-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: leads } = useQuery({
    queryKey: ["emp-leads-count"],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("converted", false);
      return count ?? 0;
    },
  });
  const { data: deals } = useQuery({
    queryKey: ["emp-deals-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("amount, stage");
      return { total: data?.reduce((s, d) => s + (d.amount || 0), 0) ?? 0, count: data?.length ?? 0 };
    },
  });
  const { data: calls } = useQuery({
    queryKey: ["emp-calls-count"],
    queryFn: async () => {
      const { count } = await supabase.from("calls").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  const { data: tasks } = useQuery({
    queryKey: ["emp-tasks-count"],
    queryFn: async () => {
      const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "Completed");
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-6">
      {/* Employee Banner */}
      <div className="bg-gradient-to-r from-warning/10 via-primary/5 to-warning/10 rounded-xl p-4 border border-warning/20">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-warning" />
          <div>
            <h2 className="font-display font-bold text-foreground">My Workspace</h2>
            <p className="text-sm text-muted-foreground">Your personal CRM — manage your contacts, leads, deals, and tasks</p>
          </div>
        </div>
      </div>

      <KpiCards contactsCount={contacts ?? 0} leadsCount={leads ?? 0} dealsTotal={deals?.total ?? 0} dealsCount={deals?.count ?? 0} callsCount={calls ?? 0} tasksCount={tasks ?? 0} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div><DealsPipeline /></div>
        <div><TasksOverview /></div>
      </div>

      <div>
        <RecentActivity />
      </div>
    </div>
  );
}
