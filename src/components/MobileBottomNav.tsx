import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Phone, ClipboardList, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  UserPlus, Building2, Handshake, FileText, BarChart3,
  Shield, History, Settings, LogOut, Bot, Calendar, Mail, Workflow,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const primaryTabs = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Contacts", icon: Users, path: "/contacts" },
  { label: "Calls", icon: Phone, path: "/calls" },
  { label: "Tasks", icon: ClipboardList, path: "/tasks" },
  { label: "More", icon: MoreHorizontal, path: "__more__" },
];

const moreItems = [
  { label: "Leads", icon: UserPlus, path: "/leads" },
  { label: "Accounts", icon: Building2, path: "/accounts" },
  { label: "Deals", icon: Handshake, path: "/deals" },
  { label: "Meetings", icon: Calendar, path: "/meetings" },
  { label: "Emails", icon: Mail, path: "/emails" },
  { label: "Notes", icon: FileText, path: "/notes" },
  { label: "Workflows", icon: Workflow, path: "/workflows" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "AI Assistant", icon: Bot, path: "/ai-assistant" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const adminItems = [
  { label: "Admin Panel", icon: Shield, path: "/admin" },
  { label: "Audit Trail", icon: History, path: "/audit-trail" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const { isAdmin, isSuperAdmin, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {primaryTabs.map((tab) => {
            const active = tab.path === "__more__" ? moreOpen : isActive(tab.path);
            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.path === "__more__") {
                    setMoreOpen(true);
                  } else {
                    navigate(tab.path);
                    setMoreOpen(false);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          <SheetHeader>
            <SheetTitle className="text-left">More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {moreItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { navigate(item.path); setMoreOpen(false); }}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors",
                  isActive(item.path) ? "bg-primary/10 text-primary" : "bg-secondary/50 text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
            {(isAdmin || isSuperAdmin) && adminItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { navigate(item.path); setMoreOpen(false); }}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors",
                  isActive(item.path) ? "bg-primary/10 text-primary" : "bg-secondary/50 text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { signOut(); setMoreOpen(false); }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
