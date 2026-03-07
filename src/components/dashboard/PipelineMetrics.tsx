import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Target, Clock, DollarSign } from "lucide-react";

export function PipelineMetrics() {
  const { data: deals } = useQuery({
    queryKey: ["pipeline-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("amount, stage, created_at, close_date");
      return data ?? [];
    },
  });

  const totalDeals = deals?.length ?? 0;
  const wonDeals = deals?.filter((d) => d.stage === "Closed Won") ?? [];
  const lostDeals = deals?.filter((d) => d.stage === "Closed Lost") ?? [];
  const openDeals = deals?.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost") ?? [];

  const winRate = totalDeals > 0 ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length || 1)) * 100) : 0;
  const avgDealSize = wonDeals.length > 0
    ? wonDeals.reduce((s, d) => s + (d.amount || 0), 0) / wonDeals.length
    : 0;
  const pipelineValue = openDeals.reduce((s, d) => s + (d.amount || 0), 0);

  // Avg sales cycle (days from created to close for won deals)
  const avgCycle = wonDeals.length > 0
    ? Math.round(wonDeals.reduce((s, d) => {
        const created = new Date(d.created_at).getTime();
        const closed = d.close_date ? new Date(d.close_date).getTime() : Date.now();
        return s + (closed - created) / (1000 * 60 * 60 * 24);
      }, 0) / wonDeals.length)
    : 0;

  const metrics = [
    { label: "Win Rate", value: `${winRate}%`, icon: Target, color: "text-success", bg: "bg-success/10" },
    { label: "Avg Deal Size", value: avgDealSize >= 1000 ? `$${(avgDealSize / 1000).toFixed(1)}k` : `$${Math.round(avgDealSize)}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pipeline Value", value: pipelineValue >= 1000 ? `$${(pipelineValue / 1000).toFixed(1)}k` : `$${Math.round(pipelineValue)}`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg Cycle", value: `${avgCycle}d`, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 crm-shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-4">Pipeline Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="text-center p-3 bg-secondary/30 rounded-lg">
            <div className={`${m.bg} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <div className="text-lg font-display font-bold text-foreground">{m.value}</div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
