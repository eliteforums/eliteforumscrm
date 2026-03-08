import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { NotificationCenter } from "@/components/NotificationCenter";

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
          <div className="h-14 md:h-16 px-3 md:px-6 flex items-center justify-between gap-2">
            <h1 className="text-sm md:text-lg font-display font-bold text-foreground truncate pl-10 lg:pl-0">
              {title ?? ""}
            </h1>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-48 lg:w-64 h-9 bg-secondary border-none text-sm" />
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 shrink-0" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
              </Button>

              <NotificationCenter />

              {actions && (
                <div className="hidden sm:flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>

          {actions && (
            <div className="sm:hidden px-3 pb-2 flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </header>
        <main className="flex-1 p-3 md:p-6 pb-20 lg:pb-6 animate-fade-in">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
