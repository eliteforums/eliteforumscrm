import { CheckCircle2, Phone, BarChart3, Users, Zap } from "lucide-react";

const showcases = [
  {
    tag: "Sales Automation",
    title: "Close Deals Faster with AI Assistance",
    description: "From lead scoring to deal forecasting, Elite CRM uses intelligent automation to help your team focus on what matters — building relationships and closing deals.",
    points: [
      "Automated lead scoring with decay rules",
      "One-click lead-to-deal conversion",
      "Pipeline velocity tracking",
      "Revenue forecasting dashboards",
    ],
    icon: Zap,
    gradient: "from-primary/10 to-accent/10",
  },
  {
    tag: "Omnichannel Engagement",
    title: "Engage Customers Across Every Channel",
    description: "Track calls, emails, meetings, and notes — all linked to the right contact. Never lose context in your customer conversations.",
    points: [
      "Click-to-call with auto call logging",
      "Email tracking per contact",
      "Meeting scheduling and reminders",
      "Unified activity timeline",
    ],
    icon: Phone,
    gradient: "from-accent/10 to-success/10",
  },
  {
    tag: "Analytics & Insights",
    title: "Data-Driven Decisions, Real-Time",
    description: "Interactive dashboards with pipeline analytics, win rates, call volume trends, and lead source analysis. Know exactly where your revenue comes from.",
    points: [
      "Pipeline velocity & win rate KPIs",
      "Sales funnel visualization",
      "Call volume & duration trends",
      "Lead source ROI analysis",
    ],
    icon: BarChart3,
    gradient: "from-success/10 to-info/10",
  },
];

export function FeatureShowcase() {
  return (
    <section id="solutions" className="py-20">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        {showcases.map((item, i) => (
          <div key={item.tag} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">{item.tag}</span>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mt-2 mb-4">
                {item.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>
              <ul className="space-y-3">
                {item.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-12 flex items-center justify-center ${i % 2 === 1 ? "lg:order-1" : ""}`}>
              <div className="w-32 h-32 rounded-2xl bg-card crm-shadow-card-hover flex items-center justify-center">
                <item.icon className="w-16 h-16 text-primary/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
