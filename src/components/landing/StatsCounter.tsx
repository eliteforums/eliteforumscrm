const stats = [
  { value: "300K+", label: "Active Users", desc: "Across 150+ countries" },
  { value: "50M+", label: "Contacts Managed", desc: "Growing daily" },
  { value: "2M+", label: "Deals Closed", desc: "And counting" },
  { value: "99.9%", label: "Uptime SLA", desc: "Enterprise reliability" },
];

export function StatsCounter() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-foreground mt-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
