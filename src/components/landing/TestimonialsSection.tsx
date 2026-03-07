import { Star, Quote } from "lucide-react";

const testimonials = [
  { quote: "Elite CRM transformed how our team manages relationships. The call tracking alone saved us 10 hours per week. The mobile PWA means our field reps can log everything on the go.", author: "Sarah Chen", role: "VP Sales, TechFlow", avatar: "SC" },
  { quote: "The role hierarchy system is exactly what we needed. Super admins have full control, while employees see only their data. Security and simplicity in one package.", author: "Marcus Johnson", role: "CTO, ScaleUp Inc", avatar: "MJ" },
  { quote: "Finally a CRM that works offline on mobile. Our field sales team can log calls even in remote areas. The PWA install experience is seamless.", author: "Priya Patel", role: "Sales Director, GlobalReach", avatar: "PP" },
  { quote: "The lead scoring automation is brilliant. We went from manually qualifying leads to having AI-driven scores that actually predict conversions. Our win rate jumped 32%.", author: "David Kim", role: "Head of Revenue, NexaCloud", avatar: "DK" },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Customers</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-4">
            Loved by Sales Teams Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.author} className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-primary/15 mb-2" />
              <p className="text-foreground mb-6 leading-relaxed">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-sm text-primary">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
