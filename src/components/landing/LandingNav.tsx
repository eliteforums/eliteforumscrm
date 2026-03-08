import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/logo.png" alt="Elite CRM" className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-contain" />
          <span className="font-display font-bold text-lg md:text-xl text-foreground tracking-tight">Elite CRM</span>
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

        <div className="flex md:hidden items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="font-medium text-xs h-8 px-2.5">Sign In</Button>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-2.5">
          <a href="#features" className="block text-sm font-medium text-muted-foreground py-1" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#solutions" className="block text-sm font-medium text-muted-foreground py-1" onClick={() => setMobileOpen(false)}>Solutions</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground py-1" onClick={() => setMobileOpen(false)}>Book a Call</a>
          <a href="#testimonials" className="block text-sm font-medium text-muted-foreground py-1" onClick={() => setMobileOpen(false)}>Customers</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>
            <Button className="w-full mt-1 h-10" size="sm">Book a Demo</Button>
          </a>
        </div>
      )}
    </nav>
  );
}
