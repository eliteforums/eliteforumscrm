import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Phone, Handshake, FileText, CheckSquare, LogIn,
  Activity, Clock, User, Crown, Shield, ShieldCheck,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type AppRole = "super_admin" | "admin" | "manager" | "employee";

const roleIcons: Record<AppRole, any> = {
  super_admin: Crown, admin: Shield, manager: ShieldCheck, employee: User,
};

interface UserWithRole {
  user_id: string;
  role: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  [key: string]: any;
}

export function EmployeeActivityPanel({ users }: { users: UserWithRole[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // CRM activity counts per user
  const { data: activityStats } = useQuery({
    queryKey: ["admin-activity-stats"],
    queryFn: async () => {
      const userIds = users.map((u) => u.user_id);
      const stats: Record<string, { contacts: number; deals: number; calls: number; tasks: number; emails: number; leads: number }> = {};

      for (const uid of userIds) {
        const [contacts, deals, calls, tasks, emails, leads] = await Promise.all([
          supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("deals").select("*", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("calls").select("*", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("emails").select("*", { count: "exact", head: true }).eq("user_id", uid),
          supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", uid),
        ]);
        stats[uid] = {
          contacts: contacts.count ?? 0,
          deals: deals.count ?? 0,
          calls: calls.count ?? 0,
          tasks: tasks.count ?? 0,
          emails: emails.count ?? 0,
          leads: leads.count ?? 0,
        };
      }
      return stats;
    },
    enabled: users.length > 0,
  });

  // Login logs
  const { data: loginLogs } = useQuery({
    queryKey: ["admin-login-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_login_logs")
        .select("*")
        .order("logged_in_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  // Audit trail (recent activity feed)
  const { data: auditFeed } = useQuery({
    queryKey: ["admin-audit-feed"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_trail")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  // Get last login per user
  const lastLoginMap: Record<string, string> = {};
  const loginCountMap: Record<string, number> = {};
  loginLogs?.forEach((log: any) => {
    if (!lastLoginMap[log.user_id]) {
      lastLoginMap[log.user_id] = log.logged_in_at;
    }
    loginCountMap[log.user_id] = (loginCountMap[log.user_id] || 0) + 1;
  });

  const selectedUser = users.find((u) => u.user_id === selectedUserId);
  const selectedStats = selectedUserId ? activityStats?.[selectedUserId] : null;
  const selectedLogins = loginLogs?.filter((l: any) => l.user_id === selectedUserId) ?? [];
  const selectedAudit = auditFeed?.filter((a: any) => a.user_id === selectedUserId) ?? [];

  const profileName = (u: UserWithRole) =>
    (u.profiles as any)?.full_name || "Unknown";

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="logins" className="gap-1.5">
            <LogIn className="w-3.5 h-3.5" /> Login Activity
          </TabsTrigger>
          <TabsTrigger value="feed" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Activity Feed
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4">
          <div className="bg-card rounded-xl crm-shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Contacts</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Deals</TableHead>
                  <TableHead className="text-center">Calls</TableHead>
                  <TableHead className="text-center">Tasks</TableHead>
                  <TableHead className="text-center">Emails</TableHead>
                  <TableHead className="text-center">Last Login</TableHead>
                  <TableHead className="text-center">Logins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const stats = activityStats?.[u.user_id];
                  const RoleIcon = roleIcons[u.role as AppRole] || User;
                  return (
                    <TableRow
                      key={u.user_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedUserId(u.user_id === selectedUserId ? null : u.user_id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-sm">{profileName(u)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="gap-1">
                          <RoleIcon className="w-3 h-3" />
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{stats?.contacts ?? "–"}</TableCell>
                      <TableCell className="text-center font-medium">{stats?.leads ?? "–"}</TableCell>
                      <TableCell className="text-center font-medium">{stats?.deals ?? "–"}</TableCell>
                      <TableCell className="text-center font-medium">{stats?.calls ?? "–"}</TableCell>
                      <TableCell className="text-center font-medium">{stats?.tasks ?? "–"}</TableCell>
                      <TableCell className="text-center font-medium">{stats?.emails ?? "–"}</TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {lastLoginMap[u.user_id]
                          ? formatDistanceToNow(new Date(lastLoginMap[u.user_id]), { addSuffix: true })
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-center font-medium">{loginCountMap[u.user_id] || 0}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Expanded user detail */}
          {selectedUser && selectedStats && (
            <Card className="mt-4 p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {profileName(selectedUser)} — Detailed Stats
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: "Contacts", value: selectedStats.contacts, icon: Users },
                  { label: "Leads", value: selectedStats.leads, icon: Users },
                  { label: "Deals", value: selectedStats.deals, icon: Handshake },
                  { label: "Calls", value: selectedStats.calls, icon: Phone },
                  { label: "Tasks", value: selectedStats.tasks, icon: CheckSquare },
                  { label: "Emails", value: selectedStats.emails, icon: FileText },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
                    <Icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <div className="text-lg font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              {/* Recent actions for this user */}
              {selectedAudit.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Actions</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedAudit.slice(0, 15).map((entry: any) => (
                      <div key={entry.id} className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2 py-1.5">
                        <Badge variant="outline" className="text-[10px]">{entry.action}</Badge>
                        <span className="text-muted-foreground">{entry.module}</span>
                        <span className="ml-auto text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        {/* LOGIN ACTIVITY TAB */}
        <TabsContent value="logins" className="mt-4">
          <div className="bg-card rounded-xl crm-shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Logged In</TableHead>
                  <TableHead>Device / Browser</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!loginLogs || loginLogs.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No login logs recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  loginLogs.slice(0, 50).map((log: any) => {
                    const user = users.find((u) => u.user_id === log.user_id);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium text-sm">
                          {user ? profileName(user) : log.user_id.slice(0, 8) + "..."}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{format(new Date(log.logged_in_at), "MMM d, yyyy h:mm a")}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.logged_in_at), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.user_agent ? parseUA(log.user_agent) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ACTIVITY FEED TAB */}
        <TabsContent value="feed" className="mt-4">
          <div className="bg-card rounded-xl crm-shadow-card p-4 space-y-2 max-h-[600px] overflow-y-auto">
            {(!auditFeed || auditFeed.length === 0) ? (
              <p className="text-center py-8 text-muted-foreground">No activity recorded yet.</p>
            ) : (
              auditFeed.map((entry: any) => {
                const user = users.find((u) => u.user_id === entry.user_id);
                return (
                  <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">
                          {user ? profileName(user) : "System"}
                        </span>
                        <Badge variant="outline" className="text-[10px]">{entry.action}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{entry.module}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        {entry.record_id && (
                          <span className="ml-2">Record: {entry.record_id.slice(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function parseUA(ua: string): string {
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Mobile")) return "Mobile Browser";
  return ua.slice(0, 40);
}
