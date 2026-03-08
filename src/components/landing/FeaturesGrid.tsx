import {
  Users, Phone, BarChart3, TrendingUp, Shield, Smartphone,
  Mail, Calendar, Workflow, Globe, Zap, Database, Sparkles, Brain, Bot, Target,
} from "lucide-react";

const features = [
  { icon: Brain, title: "AI Lead Scoring", description: "AI analyzes every lead automatically — scoring by title, revenue, engagement, and decay. Prioritize the leads most likely to convert.", color: "text-primary", bg: "bg-primary/10", ai: true },
  { icon: Bot, title: "AI Sales Assistant", description: "Built-in AI chatbot drafts emails, call scripts, meeting agendas, and deal strategies. Like having a senior sales coach 24/7.", color: "text-accent", bg: "bg-accent/10", ai: true },
  { icon: Sparkles, title: "AI Deal Insights", description: "AI predicts deal outcomes, suggests next actions, and flags at-risk deals before it's too late. Close smarter.", color: "text-warning", bg: "bg-warning/10", ai: true },
  { icon: Target, title: "AI Email Drafts", description: "One-click AI-generated follow-up emails, cold outreach, and proposal drafts tailored to each contact and deal stage.", color: "text-success", bg: "bg-success/10", ai: true },
  { icon: Users, title: "360° Contact Management", description: "Complete view of every contact with interaction history, linked deals, calls, emails, and notes in one centralized hub.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Phone, title: "Smart Call Tracking", description: "Click-to-call with auto wrap-up. Track duration, outcomes, and link calls to contacts automatically. Import phone contacts.", color: "text-accent", bg: "bg-accent/10" },
  { icon: BarChart3, title: "Visual Pipeline", description: "Kanban deal pipeline with drag stages, amounts, probabilities, and AI-powered revenue forecasting.", color: "text-success", bg: "bg-success/10" },
  { icon: Mail, title: "Email Integration", description: "Full email tracking per contact. Send, log, and track communication history with thread visibility.", color: "text-info", bg: "bg-info/10" },
  { icon: Calendar, title: "Meeting Scheduler", description: "Schedule meetings linked to contacts and deals. Google Calendar integration for seamless booking.", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Shield, title: "Enterprise RBAC", description: "4-level role hierarchy: Super Admin, Admin, Manager, Employee. SOC 2 compliant with full audit trail.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Workflow, title: "Workflow Automation", description: "Define rules that auto-trigger actions on data changes. Automate scoring, notifications, assignments, and follow-ups.", color: "text-accent", bg: "bg-accent/10" },
  { icon: Smartphone, title: "PWA + Offline Mode", description: "Install on any device. Works fully offline with background sync. Access your CRM data anywhere, even without internet.", color: "text-success", bg: "bg-success/10" },
  { icon: Database, title: "Bulk Import/Export", description: "CSV import/export for contacts, leads, and deals. Migrate from any CRM in minutes.", color: "text-warning", bg: "bg-warning/10" },
  { icon: Globe, title: "Advanced Analytics", description: "Pipeline velocity, win rates, funnel analysis, call volume, and AI-powered forecasting with interactive charts.", color: "text-info", bg: "bg-info/10" },
  { icon: TrendingUp, title: "Sales Forecasting", description: "AI-driven revenue forecasting by territory, team, and time period. Know your numbers before the quarter ends.", color: "text-destructive", bg: "bg-destructive/10" },
  { icon: Zap, title: "One-Click Conversion", description: "Convert leads to Contact + Account + Deal with one click. Full history preservation across the entire lifecycle.", color: "text-primary", bg: "bg-primary/10" },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">AI-Powered Features</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-2 mb-4">
            The Most Powerful AI CRM Ever Built
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            16+ integrated modules powered by artificial intelligence. From AI lead scoring to smart deal predictions — 
            Elite CRM is the best CRM software for modern sales teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className={`bg-card rounded-xl p-6 border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group relative ${feature.ai ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border/50 hover:border-primary/30'}`}>
              {feature.ai && (
                <div className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </div>
              )}
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
