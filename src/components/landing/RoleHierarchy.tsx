import { Shield, Lock, Users, Globe, CheckCircle2 } from "lucide-react";

const roles = [
  { role: "Super Admin", icon: Shield, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20", permissions: ["Full system access", "Manage all roles", "System configuration", "Audit logs", "Delete any record"] },
  { role: "Admin", icon: Lock, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", permissions: ["View all data", "Manage users", "Create reports", "Export data", "Bulk operations"] },
  { role: "Manager", icon: Users, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", permissions: ["View team data", "Assign leads", "Team reports", "Approve deals", "Call monitoring"] },
  { role: "Employee", icon: Globe, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", permissions: ["Own data only", "Log calls", "Manage contacts", "Track deals", "Self-service reports"] },
];

export function RoleHierarchy() {
  return (
    <section className="py-12 md:py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Security</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mt-2 mb-3 md:mb-4">
            Enterprise-Grade Role Hierarchy
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Fine-grained RBAC that mirrors your organization's structure with data isolation at every level.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {roles.map((item) => (
            <div key={item.role} className={`rounded-xl p-4 md:p-6 bg-card border ${item.border} hover:shadow-lg transition-shadow`}>
              <div className={`${item.bg} w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center mb-3 md:mb-4`}>
                <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${item.color}`} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2 md:mb-3 text-sm md:text-base">{item.role}</h3>
              <ul className="space-y-1.5 md:space-y-2">
                {item.permissions.map((p) => (
                  <li key={p} className="flex items-start gap-1.5 md:gap-2 text-[11px] md:text-sm text-muted-foreground">
                    <CheckCircle2 className={`w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 mt-0.5 ${item.color}`} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
