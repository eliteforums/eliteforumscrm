import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STAGES = [
  { name: "Qualification", color: "bg-primary" },
  { name: "Needs Analysis", color: "bg-info" },
  { name: "Value Proposition", color: "bg-chart-4" },
  { name: "Proposal", color: "bg-accent" },
  { name: "Negotiation", color: "bg-warning" },
  { name: "Closed Won", color: "bg-success" },
  { name: "Closed Lost", color: "bg-destructive" },
];

export function DealsPipeline() {
  const { data: deals } = useQuery({
    queryKey: ["deals-pipeline-widget"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("stage, amount");
      return data ?? [];
    },
  });

  const stages = STAGES.map((s) => {
    const stageDeals = deals?.filter((d) => d.stage === s.name) ?? [];
    return {
      ...s,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
    };
  });

  const total = stages.reduce((s, st) => s + st.count, 0);

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 crm-shadow-card h-full">
      <h3 className="font-display font-semibold text-foreground mb-1">Deals Pipeline</h3>
      <p className="text-sm text-muted-foreground mb-6">{total} total deals</p>
      {total === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No deals yet</div>
      ) : (
        <div className="space-y-4">
          {stages.filter((s) => s.count > 0).map((stage) => (
            <div key={stage.name}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-foreground font-medium">{stage.name}</span>
                <span className="text-muted-foreground">{stage.count} · ${stage.value.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max((stage.count / total) * 100, 5)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
