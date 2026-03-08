import { Calendar } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 md:py-20 bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Get Started</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mt-2 mb-3 md:mb-4">
            Book a Call With Us
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Schedule a personalized demo to see how Elite CRM can transform your sales workflow. Pick a time that works for you.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0AX_L2bFXqdvEqYfczKheIWDgu7w71VrweGPr5nS50060BvUOPkRb3e2LlGJ4V-RA7KuVKabsn?gv=true"
            style={{ border: 0 }}
            width="100%"
            height="500"
            className="min-h-[400px] md:min-h-[600px]"
            title="Book a call with Elite CRM"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
