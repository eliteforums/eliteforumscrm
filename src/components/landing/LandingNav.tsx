import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Elite CRM" className="w-9 h-9 rounded-xl object-contain" />
          <span className="font-display font-bold text-xl text-foreground tracking-tight">Elite CRM</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Book a Call</a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Customers</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
          </Link>
          <a href="#pricing">
            <Button size="sm" className="gap-1.5 font-medium shadow-lg shadow-primary/25">
              Book a Demo <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#solutions" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Solutions</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#testimonials" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>Customers</a>
          <Link to="/auth"><Button className="w-full mt-2">Get Started</Button></Link>
        </div>
      )}
    </nav>
  );
}
