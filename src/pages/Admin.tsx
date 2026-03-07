import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Users, User, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "super_admin" | "admin" | "manager" | "employee";

const roleConfig: Record<AppRole, { label: string; icon: any; color: string; bg: string }> = {
  super_admin: { label: "Super Admin", icon: Crown, color: "text-destructive", bg: "bg-destructive/10" },
  admin: { label: "Admin", icon: Shield, color: "text-primary", bg: "bg-primary/10" },
  manager: { label: "Manager", icon: ShieldCheck, color: "text-accent", bg: "bg-accent/10" },
  employee: { label: "Employee", icon: User, color: "text-warning", bg: "bg-warning/10" },
};

export default function AdminPage() {
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("*, profiles:user_id(full_name, avatar_url)");
      if (error) throw error;
      return roles;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated successfully");
    },
    onError: () => toast.error("Failed to update role"),
  });

  if (!isSuperAdmin) {
    return (
      <AppLayout title="Admin Panel">
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only Super Admins can access this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["super_admin", "admin", "manager", "employee"] as AppRole[]).map((r) => {
            const config = roleConfig[r];
            const count = users?.filter((u) => u.role === r).length ?? 0;
            return (
              <div key={r} className="crm-kpi-card">
                <div className={`${config.bg} p-2 rounded-lg w-fit mb-3`}>
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="text-2xl font-display font-bold text-foreground">{count}</div>
                <div className="text-sm text-muted-foreground">{config.label}s</div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-xl crm-shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading users...</TableCell></TableRow>
              ) : users?.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
              ) : (
                users?.map((u) => {
                  const config = roleConfig[u.role as AppRole] ?? roleConfig.employee;
                  const profile = u.profiles as any;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <Users className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{profile?.full_name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config.bg} ${config.color}`} variant="secondary">
                          <config.icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <select
                          value={u.role as string}
                          onChange={(e) => updateRoleMutation.mutate({ userId: u.user_id, newRole: e.target.value as AppRole })}
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                          disabled={updateRoleMutation.isPending}
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
