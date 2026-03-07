import { Shield, Award, Globe, Lock } from "lucide-react";

const badges = [
  { icon: Shield, label: "SOC 2 Compliant" },
  { icon: Award, label: "G2 Leader 2026" },
  { icon: Globe, label: "300K+ Users" },
  { icon: Lock, label: "GDPR Ready" },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border/50 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <span className="text-sm font-medium text-muted-foreground">Trusted by leading teams</span>
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-muted-foreground/70">
              <b.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
