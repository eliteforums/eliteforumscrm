import { Sparkles, TrendingUp, Users, Phone, Brain } from "lucide-react";

const stats = [
  { icon: Users, value: "50K+", label: "Contacts Managed", desc: "Across teams worldwide" },
  { icon: Phone, value: "1.2M+", label: "Calls Tracked", desc: "With AI wrap-up" },
  { icon: Brain, value: "10M+", label: "AI Predictions", desc: "Lead scores & insights" },
  { icon: TrendingUp, value: "99.9%", label: "Uptime SLA", desc: "Enterprise reliability" },
];

export function StatsCounter() {
  return (
    <section className="py-10 md:py-16 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center gap-2 text-primary text-xs md:text-sm font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Trusted by Sales Teams
          </div>
          <h2 className="text-xl md:text-3xl font-display font-bold text-foreground">
            The Best AI CRM by the Numbers
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group cursor-default">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-2xl md:text-4xl font-display font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-foreground mt-1">{stat.label}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
