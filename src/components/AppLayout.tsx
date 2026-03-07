import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export function AppLayout({ children, title, actions }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="min-h-14 md:min-h-16 px-3 md:px-6 py-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 pl-10 lg:pl-0 min-w-0">
              {title && <h1 className="text-base md:text-lg font-display font-bold text-foreground truncate">{title}</h1>}
            </div>
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-48 lg:w-64 h-9 bg-secondary border-none text-sm" />
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 shrink-0">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              {actions && (
                <div className="min-w-0 flex-1 md:flex-none overflow-x-auto">
                  <div className="flex w-max items-center gap-2 pr-1">{actions}</div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 md:p-6 pb-20 lg:pb-6 animate-fade-in">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
