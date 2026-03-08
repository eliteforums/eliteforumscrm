import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 crm-gradient-primary opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative px-8 md:px-16 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium text-primary-foreground mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered CRM
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to Close More Deals with AI?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join teams already using Elite CRM's AI to score leads, predict outcomes, and automate workflows. Book a free demo today.
            </p>
            <a href="https://calendar.app.google/FmdoMp2gFvXTKqD16" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-10 h-13 font-bold shadow-xl">
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
