import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="absolute inset-0 crm-gradient-primary opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative px-6 md:px-16 py-10 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium text-primary-foreground mb-4 md:mb-6">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> AI-Powered CRM
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground mb-3 md:mb-4">
              Ready to Close More Deals with AI?
            </h2>
            <p className="text-sm md:text-lg text-primary-foreground/80 mb-6 md:mb-8 max-w-xl mx-auto">
              Join teams already using Elite CRM's AI to score leads, predict outcomes, and automate workflows. Book a free demo today.
            </p>
            <a href="#pricing">
              <Button size="lg" variant="secondary" className="gap-2 text-sm md:text-base px-8 md:px-10 h-11 md:h-13 font-bold shadow-xl">
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
