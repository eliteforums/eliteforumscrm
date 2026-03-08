import { useState } from "react";
import { EmployeeActivityPanel } from "@/components/admin/EmployeeActivityPanel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, ShieldCheck, Users, User, Crown, Plus, Loader2, Eye, EyeOff, Mail, Lock, UserPlus } from "lucide-react";
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
  const { isSuperAdmin, isAdmin, session } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "employee">("employee");
  const [showPassword, setShowPassword] = useState(false);

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

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email: newEmail, password: newPassword, full_name: newFullName, role: newRole },
      });

      if (error) {
        const functionContext = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
        if (functionContext?.json) {
          const payload = await functionContext.json().catch(() => null);
          throw new Error(payload?.error || error.message);
        }
        throw error;
      }

      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created successfully! They can now log in with the provided credentials.");
      setCreateOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFullName("");
      setNewRole("employee");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create user"),
  });

  if (!isSuperAdmin && !isAdmin) {
    return (
      <AppLayout title="Admin Panel">
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only Admins and Super Admins can access this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="User Management">
      <div className="space-y-6">
        {/* Role Stats */}
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

        {/* Create User Button - Super Admin only */}
        {isSuperAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" /> Create New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Create New User
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); createUserMutation.mutate(); }}
                className="space-y-4 mt-2"
              >
                <div>
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="John Doe"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="user@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-9 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Role *</Label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                  The user will be able to log in immediately with the email and password you set here. Share these credentials securely.
                </div>
                <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create User
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Users Table */}
        <div className="bg-card rounded-xl crm-shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Role</TableHead>
                {isSuperAdmin && <TableHead>Change Role</TableHead>}
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
                      {isSuperAdmin && (
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
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Employee Activity Tracking */}
        <div className="mt-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Employee Activity Tracking</h3>
          <EmployeeActivityPanel users={users ?? []} />
        </div>
      </div>
    </AppLayout>
  );
}
