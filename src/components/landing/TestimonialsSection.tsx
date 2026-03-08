import { Star, Quote } from "lucide-react";

const testimonials = [
  { quote: "Elite CRM transformed how our team manages relationships. The call tracking alone saved us 10 hours per week. The mobile PWA means our field reps can log everything on the go.", author: "Sarah Chen", role: "VP Sales, TechFlow", avatar: "SC" },
  { quote: "The role hierarchy system is exactly what we needed. Super admins have full control, while employees see only their data. Security and simplicity in one package.", author: "Marcus Johnson", role: "CTO, ScaleUp Inc", avatar: "MJ" },
  { quote: "Finally a CRM that works offline on mobile. Our field sales team can log calls even in remote areas. The PWA install experience is seamless.", author: "Priya Patel", role: "Sales Director, GlobalReach", avatar: "PP" },
  { quote: "The lead scoring automation is brilliant. We went from manually qualifying leads to having AI-driven scores that actually predict conversions. Our win rate jumped 32%.", author: "David Kim", role: "Head of Revenue, NexaCloud", avatar: "DK" },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Customers</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mt-2 mb-4">
            Loved by Sales Teams Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {testimonials.map((t) => (
            <div key={t.author} className="bg-card rounded-xl p-5 md:p-6 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex gap-0.5 mb-3 md:mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-warning text-warning" />
                ))}
              </div>
              <Quote className="w-6 h-6 md:w-8 md:h-8 text-primary/15 mb-2" />
              <p className="text-sm md:text-base text-foreground mb-4 md:mb-6 leading-relaxed">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-xs md:text-sm text-primary">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-xs md:text-sm text-foreground">{t.author}</div>
                  <div className="text-[11px] md:text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
