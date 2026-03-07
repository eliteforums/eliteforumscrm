import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, UserPlus, Building2, Handshake, Phone,
  ChevronLeft, ChevronRight, Zap, Shield, LogOut, Crown,
  ClipboardList, FileText, Menu, X, Settings, History, BarChart3,
  Calendar, Mail, Workflow, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

type NavItem = {
  title: string;
  url: string;
  icon: any;
  minRole?: "employee" | "manager" | "admin" | "super_admin";
};

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "Accounts", url: "/accounts", icon: Building2 },
  { title: "Deals", url: "/deals", icon: Handshake },
  { title: "Calls", url: "/calls", icon: Phone },
  { title: "Meetings", url: "/meetings", icon: Calendar },
  { title: "Emails", url: "/emails", icon: Mail },
  { title: "Tasks", url: "/tasks", icon: ClipboardList },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Workflows", url: "/workflows", icon: Workflow, minRole: "manager" },
  { title: "Reports", url: "/reports", icon: BarChart3, minRole: "manager" },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
];

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", manager: "Manager", employee: "Employee",
};
const roleColors: Record<string, string> = {
  super_admin: "bg-destructive/20 text-destructive", admin: "bg-primary/20 text-primary",
  manager: "bg-accent/20 text-accent", employee: "bg-warning/20 text-warning",
};

const roleHierarchy: Record<string, number> = {
  employee: 1, manager: 2, admin: 3, super_admin: 4,
};

function hasMinRole(userRole: string | null, minRole?: string): boolean {
  if (!minRole) return true;
  return (roleHierarchy[userRole ?? "employee"] ?? 1) >= (roleHierarchy[minRole] ?? 1);
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { role, isSuperAdmin, isAdmin, signOut, user } = useAuth();

  const visibleNavItems = navItems.filter(item => hasMinRole(role, item.minRole));

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg crm-gradient-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display font-bold text-lg text-sidebar-accent-foreground tracking-tight">Elite CRM</span>}
        </div>
        <button className="lg:hidden text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {!collapsed && role && (
        <div className="px-5 py-3 border-b border-sidebar-border">
          <Badge className={cn("text-xs", roleColors[role] || "")} variant="secondary">
            {role === "super_admin" && <Crown className="w-3 h-3 mr-1" />}
            {roleLabels[role] || role}
          </Badge>
          <p className="text-xs text-sidebar-foreground mt-1 truncate">{user?.email}</p>
        </div>
      )}

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
          return (
            <NavLink key={item.title} to={item.url} end={item.url === "/dashboard"}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent", collapsed && "justify-center px-0")}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
        {(isSuperAdmin || isAdmin) && (
          <>
            <div className={cn("my-3 border-t border-sidebar-border", collapsed && "mx-2")} />
            <NavLink to="/admin" onClick={() => setMobileOpen(false)}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent", collapsed && "justify-center px-0")}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
              <Shield className={cn("w-4.5 h-4.5 flex-shrink-0", location.pathname === "/admin" && "text-sidebar-primary")} />
              {!collapsed && <span>Admin Panel</span>}
            </NavLink>
            <NavLink to="/audit-trail" onClick={() => setMobileOpen(false)}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent", collapsed && "justify-center px-0")}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
              <History className={cn("w-4.5 h-4.5 flex-shrink-0", location.pathname === "/audit-trail" && "text-sidebar-primary")} />
              {!collapsed && <span>Audit Trail</span>}
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavLink to="/settings" onClick={() => setMobileOpen(false)}
          className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors text-sm", collapsed && "justify-center")}
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
          <Settings className="w-4 h-4" />{!collapsed && <span>Settings</span>}
        </NavLink>
        <button onClick={() => signOut()}
          className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-sm", collapsed && "justify-center")}>
          <LogOut className="w-4 h-4" />{!collapsed && <span>Sign Out</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors text-sm">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card crm-shadow-card text-foreground">
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 crm-gradient-sidebar flex flex-col w-[280px] transition-transform duration-300 lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      <aside className={cn(
        "hidden lg:flex crm-gradient-sidebar flex-col h-screen sticky top-0 transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
