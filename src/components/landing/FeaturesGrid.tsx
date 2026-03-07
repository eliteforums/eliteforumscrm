import {
  Users, Phone, BarChart3, TrendingUp, Shield, Smartphone,
  Mail, Calendar, Workflow, Globe, Zap, Database,
} from "lucide-react";

const features = [
  { icon: Users, title: "Contact Management", description: "360° view of every contact. Track interactions, relationships, and touchpoints in one centralized hub.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Phone, title: "Call Tracking & Logging", description: "Click-to-call with auto wrap-up. Track duration, outcomes, and link calls to contacts automatically.", color: "text-accent", bg: "bg-accent/10" },
  { icon: BarChart3, title: "Pipeline & Deals", description: "Visual kanban pipeline. Track stages, amounts, probabilities, and forecast revenue with precision.", color: "text-success", bg: "bg-success/10" },
  { icon: TrendingUp, title: "AI Lead Scoring", description: "Automated lead qualification with decay rules. Prioritize outreach by conversion likelihood.", color: "text-warning", bg: "bg-warning/10" },
  { icon: Mail, title: "Email Tracking", description: "Log emails per contact. Track communication history with full thread visibility and status.", color: "text-info", bg: "bg-info/10" },
  { icon: Calendar, title: "Meetings & Events", description: "Schedule meetings linked to contacts and deals. Never miss a follow-up with calendar integration.", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Shield, title: "Role-Based Access", description: "4-level RBAC: Super Admin, Admin, Manager, Employee. Fine-grained data visibility controls.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Workflow, title: "Workflow Automation", description: "Define rules that trigger actions on data changes. Automate lead scoring, notifications, and updates.", color: "text-accent", bg: "bg-accent/10" },
  { icon: Smartphone, title: "PWA Mobile Access", description: "Install on any device. Works offline with background sync. Access CRM data anywhere, anytime.", color: "text-success", bg: "bg-success/10" },
  { icon: Database, title: "CSV Import/Export", description: "Bulk import contacts, leads, and deals from CSV. Export any module with one click.", color: "text-warning", bg: "bg-warning/10" },
  { icon: Globe, title: "Reports & Analytics", description: "Pipeline velocity, win rates, funnel analysis, call volume — all with interactive charts.", color: "text-info", bg: "bg-info/10" },
  { icon: Zap, title: "Lead Conversion", description: "One-click conversion from Lead to Contact + Account + Deal with full history preservation.", color: "text-destructive", bg: "bg-destructive/10" },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-4">
            Everything You Need to Sell Smarter
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete CRM platform with AI-powered lead scoring, offline PWA support, workflow automation, and enterprise-grade security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
              <div className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
