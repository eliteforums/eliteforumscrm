import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 crm-gradient-primary opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative px-8 md:px-16 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium text-primary-foreground mb-6">
              <Zap className="w-4 h-4" /> Ready to grow?
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to Supercharge Your Sales?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of sales teams already using Elite CRM to close more deals, faster. Start free today.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-10 h-13 font-bold shadow-xl">
                Start Your Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
