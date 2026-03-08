import { Sparkles, TrendingUp, Users, Phone, Brain } from "lucide-react";

const stats = [
  { icon: Users, value: "50K+", label: "Contacts Managed", desc: "Across teams worldwide" },
  { icon: Phone, value: "1.2M+", label: "Calls Tracked", desc: "With AI wrap-up" },
  { icon: Brain, value: "10M+", label: "AI Predictions", desc: "Lead scores & insights" },
  { icon: TrendingUp, value: "99.9%", label: "Uptime SLA", desc: "Enterprise reliability" },
];

export function StatsCounter() {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4" /> Trusted by Sales Teams
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            The Best AI CRM by the Numbers
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                <stat.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
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
