import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowLeft, Shield, BarChart3, Users, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden crm-gradient-primary">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute top-20 right-20 w-24 h-24 border border-white/10 rounded-2xl rotate-12" />
          <div className="absolute bottom-32 left-16 w-16 h-16 border border-white/10 rounded-xl -rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" alt="Elite CRM" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1" />
              <span className="text-xl font-display font-bold tracking-tight">Elite CRM</span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display font-extrabold leading-tight mb-4">
                Manage your business<br />
                <span className="text-white/80">like never before.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-md">
                Streamline your sales pipeline, track every interaction, and close deals faster with Elite CRM.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                { icon: BarChart3, label: "Real-time Analytics", desc: "Live dashboards" },
                { icon: Users, label: "Team Management", desc: "Role-based access" },
                { icon: Shield, label: "Enterprise Security", desc: "SOC 2 compliant" },
                { icon: Zap, label: "Automation", desc: "Smart workflows" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-white/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} Elite CRM. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Elite CRM" className="w-10 h-10 rounded-xl object-contain" />
            <span className="text-lg font-display font-bold text-foreground">Elite CRM</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access your CRM dashboard
            </p>
          </div>

          <div className="bg-card rounded-2xl p-7 border border-border/50 shadow-lg shadow-primary/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/80 focus:border-primary/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/80 focus:border-primary/50 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold crm-gradient-primary hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/50">
              <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-3.5">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is an invite-only platform. Contact your <span className="font-semibold text-foreground">Super Admin</span> to get your login credentials.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}
