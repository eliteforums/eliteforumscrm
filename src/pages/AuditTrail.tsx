import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Edit, Trash2, Eye, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const actionConfig: Record<string, { icon: any; color: string; bg: string }> = {
  CREATE: { icon: Plus, color: "text-success", bg: "bg-success/10" },
  UPDATE: { icon: Edit, color: "text-warning", bg: "bg-warning/10" },
  DELETE: { icon: Trash2, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function AuditTrailPage() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["audit-trail", search, moduleFilter],
    queryFn: async () => {
      let q = supabase.from("audit_trail")
        .select("*, profiles:user_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (moduleFilter !== "all") q = q.eq("module", moduleFilter);
      if (search) q = q.or(`action.ilike.%${search}%,module.ilike.%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: isAdmin || isSuperAdmin,
  });

  if (!isAdmin && !isSuperAdmin) {
    return (
      <AppLayout title="Audit Trail">
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only Admins can access the audit trail.</p>
        </div>
      </AppLayout>
    );
  }

  const modules = ["all", "contacts", "leads", "accounts", "deals", "calls", "tasks", "notes"];

  return (
    <AppLayout title="Audit Trail">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search actions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {modules.map((m) => (
              <Button key={m} size="sm" variant={moduleFilter === m ? "default" : "outline"} onClick={() => setModuleFilter(m)} className="capitalize text-xs">
                {m === "all" ? "All Modules" : m}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl crm-shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : entries?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No audit trail entries yet
                </TableCell></TableRow>
              ) : entries?.map((entry) => {
                const config = actionConfig[entry.action] || actionConfig.UPDATE;
                const profile = entry.profiles as any;
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="secondary" className={`${config.bg} ${config.color} gap-1`}>
                        <config.icon className="w-3 h-3" />
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-sm font-medium">{entry.module}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{profile?.full_name || "System"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{entry.record_id?.slice(0, 8)}...</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(entry.created_at), "MMM d, h:mm a")}</TableCell>
                    <TableCell className="max-w-[200px]">
                      {entry.new_values && (
                        <p className="text-xs text-muted-foreground truncate">
                          {JSON.stringify(entry.new_values).slice(0, 60)}...
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
