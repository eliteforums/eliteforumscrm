import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const plans = [
  { name: "Starter", price: "$0", period: "/month", description: "For individuals getting started", features: ["Up to 250 contacts", "Basic call logging", "5 deals", "CSV import/export", "Email support"], cta: "Get Started Free", highlighted: false },
  { name: "Professional", price: "$29", period: "/user/month", description: "For growing sales teams", features: ["Unlimited contacts", "Advanced call tracking", "Unlimited deals", "AI lead scoring", "Role management", "Workflow automation", "Email tracking", "Meetings module", "Priority support"], cta: "Start Free Trial", highlighted: true },
  { name: "Enterprise", price: "$79", period: "/user/month", description: "For large organizations", features: ["Everything in Pro", "Custom roles & hierarchies", "API access", "SSO & SAML", "Advanced analytics", "Dedicated account manager", "SLA guarantee"], cta: "Contact Sales", highlighted: false },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">No hidden fees. Start free. Upgrade when ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 relative ${plan.highlighted ? "bg-card border-2 border-primary shadow-xl shadow-primary/10 scale-[1.02]" : "bg-card border border-border/50"}`}>
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="font-display font-bold text-lg text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-display font-extrabold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button className="w-full font-semibold" variant={plan.highlighted ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
