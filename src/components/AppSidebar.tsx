import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, UserPlus, Building2, Handshake, Phone,
  ChevronLeft, ChevronRight, Zap, Shield, LogOut, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "Accounts", url: "/accounts", icon: Building2 },
  { title: "Deals", url: "/deals", icon: Handshake },
  { title: "Calls", url: "/calls", icon: Phone },
];

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

const roleColors: Record<string, string> = {
  super_admin: "bg-destructive/20 text-destructive",
  admin: "bg-primary/20 text-primary",
  manager: "bg-accent/20 text-accent",
  employee: "bg-warning/20 text-warning",
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { role, isSuperAdmin, isAdmin, signOut, user } = useAuth();

  return (
    <aside
      className={cn(
        "crm-gradient-sidebar flex flex-col h-screen sticky top-0 transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg crm-gradient-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-sidebar-accent-foreground tracking-tight">
            Elite CRM
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && role && (
        <div className="px-5 py-3 border-b border-sidebar-border">
          <Badge className={cn("text-xs", roleColors[role] || "")} variant="secondary">
            {role === "super_admin" && <Crown className="w-3 h-3 mr-1" />}
            {roleLabels[role] || role}
          </Badge>
          <p className="text-xs text-sidebar-foreground mt-1 truncate">{user?.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url ||
            (item.url !== "/dashboard" && location.pathname.startsWith(item.url));
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/dashboard"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-0"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}

        {/* Admin link - only for super_admin and admin */}
        {(isSuperAdmin || isAdmin) && (
          <>
            <div className={cn("my-3 border-t border-sidebar-border", collapsed && "mx-2")} />
            <NavLink
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-0"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <Shield className={cn("w-5 h-5 flex-shrink-0", location.pathname === "/admin" && "text-sidebar-primary")} />
              {!collapsed && <span>Admin Panel</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => signOut()}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-sm",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors text-sm",
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
