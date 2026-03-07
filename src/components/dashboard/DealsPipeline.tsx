const stages = [
  { name: "Qualification", count: 8, value: 45000, color: "bg-primary" },
  { name: "Proposal", count: 5, value: 32000, color: "bg-info" },
  { name: "Negotiation", count: 3, value: 28000, color: "bg-warning" },
  { name: "Closed Won", count: 12, value: 156000, color: "bg-success" },
  { name: "Closed Lost", count: 4, value: 18000, color: "bg-destructive" },
];

export function DealsPipeline() {
  const total = stages.reduce((s, st) => s + st.count, 0);

  return (
    <div className="bg-card rounded-xl p-6 crm-shadow-card h-full">
      <h3 className="font-display font-semibold text-foreground mb-1">Deals Pipeline</h3>
      <p className="text-sm text-muted-foreground mb-6">{total} total deals</p>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.name}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-foreground font-medium">{stage.name}</span>
              <span className="text-muted-foreground">{stage.count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                style={{ width: `${(stage.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
