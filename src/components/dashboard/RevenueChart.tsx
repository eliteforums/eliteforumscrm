import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

export function RevenueChart() {
  const { data: deals } = useQuery({
    queryKey: ["deals-revenue-chart"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("amount, stage, created_at, close_date");
      return data ?? [];
    },
  });

  const chartData = useMemo(() => {
    if (!deals?.length) return [];
    const months: Record<string, { month: string; won: number; pipeline: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      months[key] = { month: key, won: 0, pipeline: 0 };
    }
    deals.forEach((deal) => {
      const d = new Date(deal.close_date || deal.created_at);
      const key = d.toLocaleString("default", { month: "short" });
      if (months[key]) {
        if (deal.stage === "Closed Won") months[key].won += deal.amount || 0;
        else if (deal.stage !== "Closed Lost") months[key].pipeline += deal.amount || 0;
      }
    });
    return Object.values(months);
  }, [deals]);

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 crm-shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Won vs pipeline (last 6 months)</p>
        </div>
      </div>
      <div className="h-[240px] md:h-[280px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Add deals to see revenue chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="won" name="Won" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pipeline" name="Pipeline" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
