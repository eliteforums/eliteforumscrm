import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Workflow, Zap, Power, PowerOff, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const MODULES = ["leads", "contacts", "deals", "accounts", "tasks", "calls"];
const TRIGGERS = ["create", "update", "delete"];
const ACTION_TYPES = ["update_field", "create_task", "send_notification"];

export default function WorkflowsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: rules, isLoading } = useQuery({
    queryKey: ["workflow-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("workflow_rules").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const rule = {
        user_id: user!.id,
        name: formData.get("name") as string,
        module: formData.get("module") as string,
        trigger_event: formData.get("trigger_event") as string,
        is_active: true,
        conditions: JSON.parse(formData.get("conditions") as string || "[]"),
        actions: JSON.parse(formData.get("actions") as string || "[]"),
      };
      if (editing) {
        const { error } = await supabase.from("workflow_rules").update(rule).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("workflow_rules").insert(rule);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      setIsOpen(false); setEditing(null);
      toast.success(editing ? "Rule updated" : "Rule created");
    },
    onError: () => toast.error("Failed to save rule"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("workflow_rules").update({ is_active: !isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-rules"] });
      toast.success("Rule toggled");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workflow_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["workflow-rules"] }); toast.success("Rule deleted"); },
  });

  return (
    <AppLayout title="Workflow Automation" actions={
      <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Rule</span><span className="sm:hidden">New</span></Button></DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Rule" : "New Workflow Rule"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
            <div><Label>Rule Name *</Label><Input name="name" required defaultValue={editing?.name} placeholder="e.g., Auto-score new leads" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Module</Label>
                <select name="module" defaultValue={editing?.module || "leads"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {MODULES.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
                </select>
              </div>
              <div><Label>Trigger</Label>
                <select name="trigger_event" defaultValue={editing?.trigger_event || "create"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {TRIGGERS.map((t) => <option key={t} value={t}>On {t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Conditions (JSON)</Label>
              <Input name="conditions" defaultValue={editing ? JSON.stringify(editing.conditions) : '[]'} placeholder='[{"field":"lead_status","operator":"equals","value":"New"}]' className="font-mono text-xs" />
              <p className="text-xs text-muted-foreground mt-1">JSON array of conditions</p>
            </div>
            <div>
              <Label>Actions (JSON)</Label>
              <Input name="actions" defaultValue={editing ? JSON.stringify(editing.actions) : '[]'} placeholder='[{"type":"update_field","field":"score","value":"50"}]' className="font-mono text-xs" />
              <p className="text-xs text-muted-foreground mt-1">JSON array of actions</p>
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Create"} Rule</Button>
          </form>
        </DialogContent>
      </Dialog>
    }>
      {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : rules?.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center text-muted-foreground crm-shadow-card">
          <Workflow className="w-12 h-12 mx-auto mb-3 opacity-30" />
          No workflow rules yet. Create your first automation rule!
        </div>
      ) : (
        <div className="space-y-3">
          {rules?.map((rule) => (
            <div key={rule.id} className="bg-card rounded-xl p-5 crm-shadow-card hover:crm-shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${rule.is_active ? "bg-success/10" : "bg-muted"}`}>
                    <Zap className={`w-5 h-5 ${rule.is_active ? "text-success" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{rule.name}</h4>
                      <Badge variant="secondary" className={rule.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      On <span className="font-medium">{rule.trigger_event}</span> in <span className="font-medium capitalize">{rule.module}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {formatDistanceToNow(new Date(rule.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMutation.mutate({ id: rule.id, isActive: rule.is_active })} title={rule.is_active ? "Deactivate" : "Activate"}>
                    {rule.is_active ? <PowerOff className="w-4 h-4 text-warning" /> : <Power className="w-4 h-4 text-success" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(rule); setIsOpen(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(rule.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
