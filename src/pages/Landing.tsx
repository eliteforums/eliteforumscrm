import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap, Users, Phone, BarChart3, Shield, Globe, ArrowRight, CheckCircle2,
  Smartphone, Cloud, Lock, TrendingUp, Star, ChevronRight,
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

const features = [
  {
    icon: Users,
    title: "Contact Management",
    description: "Centralized hub for your entire professional network. Track every interaction, relationship, and touchpoint.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Phone,
    title: "Call Logging & Tracking",
    description: "Log every call automatically. Track duration, purpose, outcomes, and link calls directly to contacts.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Pipeline & Deals",
    description: "Visual kanban pipeline. Track deal stages, amounts, probabilities, and forecast revenue accurately.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: TrendingUp,
    title: "Lead Scoring",
    description: "Automated lead qualification with scoring rules. Prioritize outreach based on conversion likelihood.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Multi-hierarchy permissions: Super Admin, Admin, Manager, Employee. Fine-grained data visibility.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: Smartphone,
    title: "PWA Mobile Access",
    description: "Install on any device. Works offline. Access contacts and log calls anywhere, even without internet.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "For individuals getting started",
    features: ["Up to 250 contacts", "Basic call logging", "5 deals", "Email support"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "/user/month",
    description: "For growing sales teams",
    features: ["Unlimited contacts", "Advanced call tracking", "Unlimited deals", "Lead scoring", "Role management", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$79",
    period: "/user/month",
    description: "For large organizations",
    features: ["Everything in Pro", "Custom roles & hierarchies", "API access", "SSO & SAML", "Dedicated account manager", "SLA guarantee"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "2.5M+", label: "Contacts Managed" },
  { value: "500K+", label: "Calls Tracked" },
  { value: "99.9%", label: "Uptime" },
];

const testimonials = [
  {
    quote: "Elite CRM transformed how our team manages relationships. The call tracking alone saved us 10 hours per week.",
    author: "Sarah Chen",
    role: "VP Sales, TechFlow",
    rating: 5,
  },
  {
    quote: "The role hierarchy system is exactly what we needed. Super admins have full control, while employees see only their data.",
    author: "Marcus Johnson",
    role: "CTO, ScaleUp Inc",
    rating: 5,
  },
  {
    quote: "Finally a CRM that works offline on mobile. Our field sales team can log calls even in remote areas.",
    author: "Priya Patel",
    role: "Sales Director, GlobalReach",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg crm-gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Elite CRM</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-1">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Enterprise-grade CRM with PWA support
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-foreground leading-tight mb-6">
              Close More Deals.<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Faster Than Ever.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Manage contacts, track calls, nurture leads, and close deals — all from one powerful platform. 
              Works everywhere, even offline.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-base px-8 h-12">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
                  See Features
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-2xl opacity-50" />
            <div className="relative rounded-xl overflow-hidden border border-border crm-shadow-card">
              <img src={heroImage} alt="Elite CRM Dashboard" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-extrabold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need to Sell Smarter
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete CRM platform with multi-hierarchy role management, offline PWA support, and enterprise-grade security.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card rounded-xl p-6 crm-shadow-card hover:crm-shadow-card-hover transition-all duration-300 group">
                <div className={`${feature.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Hierarchy */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Multi-Level Role Hierarchy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fine-grained access control that mirrors your organization's structure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "Super Admin",
                icon: Shield,
                color: "text-destructive",
                bg: "bg-destructive/10",
                border: "border-destructive/20",
                permissions: ["Full system access", "Manage all roles", "System configuration", "Audit logs", "Delete any record"],
              },
              {
                role: "Admin",
                icon: Lock,
                color: "text-primary",
                bg: "bg-primary/10",
                border: "border-primary/20",
                permissions: ["View all data", "Manage users", "Create reports", "Export data", "Bulk operations"],
              },
              {
                role: "Manager",
                icon: Users,
                color: "text-accent",
                bg: "bg-accent/10",
                border: "border-accent/20",
                permissions: ["View team data", "Assign leads", "Team reports", "Approve deals", "Call monitoring"],
              },
              {
                role: "Employee",
                icon: Globe,
                color: "text-warning",
                bg: "bg-warning/10",
                border: "border-warning/20",
                permissions: ["Own data only", "Log calls", "Manage contacts", "Track deals", "Self-service reports"],
              },
            ].map((item) => (
              <div key={item.role} className={`rounded-xl p-6 bg-background border ${item.border} relative overflow-hidden`}>
                <div className={`${item.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-3">{item.role}</h3>
                <ul className="space-y-2">
                  {item.permissions.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${item.color}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Loved by Sales Teams Worldwide
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-card rounded-xl p-6 crm-shadow-card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-sm text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 relative ${
                  plan.highlighted
                    ? "bg-background border-2 border-primary crm-shadow-card-hover"
                    : "bg-background border border-border crm-shadow-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display font-semibold text-lg text-foreground">{plan.name}</h3>
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
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to Supercharge Your Sales?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of sales teams already using Elite CRM to close more deals, faster.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 text-base px-10 h-12">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg crm-gradient-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">Elite CRM</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Elite CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
