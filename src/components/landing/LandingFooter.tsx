import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <img src="/logo.png" alt="Elite CRM" className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-contain" />
              <span className="font-display font-bold text-foreground text-sm md:text-base">Elite CRM</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-2">Enterprise-grade CRM with PWA support. Manage contacts, track calls, and close deals from anywhere.</p>
            <p className="text-[11px] md:text-xs text-muted-foreground">A product by <a href="https://eliteforums.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Elite Forums</a></p>
          </div>
          <div>
            <h4 className="font-semibold text-xs md:text-sm text-foreground mb-2 md:mb-3">Product</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#solutions" className="hover:text-foreground transition-colors">Solutions</a></li>
              <li><a href="#testimonials" className="hover:text-foreground transition-colors">Customers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xs md:text-sm text-foreground mb-2 md:mb-3">Platform</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li>Contact Management</li>
              <li>Call Tracking</li>
              <li>Pipeline Management</li>
              <li>Workflow Automation</li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-xs md:text-sm text-foreground mb-2 md:mb-3">Security</h4>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-muted-foreground">
              <li>SOC 2 Compliant</li>
              <li>GDPR Ready</li>
              <li>Role-Based Access</li>
              <li>Audit Trail</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            <p>© {new Date().getFullYear()} Elite CRM. All rights reserved.</p>
            <p className="mt-1">A product by <a href="https://eliteforums.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Elite Forums</a></p>
          </div>
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
