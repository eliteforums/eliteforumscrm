import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="Elite CRM" className="w-10 h-10 rounded-xl object-contain" />
          <span className="text-lg font-display font-bold text-foreground">Elite CRM</span>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-6xl font-display font-extrabold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="gap-2 crm-gradient-primary">
            <Link to="/"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          A product by <a href="https://eliteforums.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Elite Forums</a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
