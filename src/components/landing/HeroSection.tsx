import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-16 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              #1 AI-Powered CRM Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-[1.1] mb-6">
              The Smartest
              <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                AI-Powered CRM.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              AI that scores your leads, drafts your emails, predicts deal outcomes, and automates your workflows.
              The best CRM software for teams that want to close more, faster.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <a href="#pricing">
                <Button size="lg" className="gap-2 text-base px-8 h-13 shadow-xl shadow-primary/20 font-semibold">
                  Book a Demo <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#features">
                <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-13 font-semibold">
                  <Play className="w-4 h-4" /> See Features
                </Button>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              {["AI-powered lead scoring", "Works offline (PWA)", "Enterprise security"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right column - Dashboard preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-foreground/5">
              <img src={heroImage} alt="Elite CRM AI-Powered Dashboard - Best CRM Software for Sales Teams" className="w-full" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>

            {/* Floating cards */}
            <div className="absolute -left-6 top-1/4 bg-card rounded-xl p-3 crm-shadow-card-hover border border-border/50 hidden lg:flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <span className="text-success font-bold text-sm">+32%</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Win Rate</p>
                <p className="text-xs text-muted-foreground">AI-optimized</p>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/3 bg-card rounded-xl p-3 crm-shadow-card-hover border border-border/50 hidden lg:flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">AI Insights</p>
                <p className="text-xs text-muted-foreground">Real-time</p>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/6 bg-card rounded-xl p-3 crm-shadow-card-hover border border-border/50 hidden lg:flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <span className="text-warning font-bold text-sm">$2.4M</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Pipeline</p>
                <p className="text-xs text-muted-foreground">Active deals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
