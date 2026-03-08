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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-16">
          <span className="text-xs md:text-sm font-medium text-muted-foreground w-full md:w-auto text-center">Trusted by leading teams</span>
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-1.5 md:gap-2 text-muted-foreground/70">
              <b.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
