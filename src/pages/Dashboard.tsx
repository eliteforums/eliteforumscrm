import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DealsPipeline } from "@/components/dashboard/DealsPipeline";

export default function Dashboard() {
  const { data: contacts } = useQuery({
    queryKey: ["contacts-count"],
    queryFn: async () => {
      const { count } = await supabase.from("contacts").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads-count"],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: deals } = useQuery({
    queryKey: ["deals-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("amount, stage");
      const total = data?.reduce((sum, d) => sum + (d.amount || 0), 0) ?? 0;
      const count = data?.length ?? 0;
      return { total, count };
    },
  });

  const { data: calls } = useQuery({
    queryKey: ["calls-count"],
    queryFn: async () => {
      const { count } = await supabase.from("calls").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <KpiCards
          contactsCount={contacts ?? 0}
          leadsCount={leads ?? 0}
          dealsTotal={deals?.total ?? 0}
          dealsCount={deals?.count ?? 0}
          callsCount={calls ?? 0}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <DealsPipeline />
          </div>
        </div>
        <RecentActivity />
      </div>
    </AppLayout>
  );
}
