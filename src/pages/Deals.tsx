import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const STAGES = ["Qualification", "Needs Analysis", "Value Proposition", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const stageColors: Record<string, string> = {
  "Qualification": "bg-info/10 text-info",
  "Needs Analysis": "bg-primary/10 text-primary",
  "Value Proposition": "bg-warning/10 text-warning",
  "Proposal": "bg-accent/10 text-accent",
  "Negotiation": "bg-warning/10 text-warning",
  "Closed Won": "bg-success/10 text-success",
  "Closed Lost": "bg-destructive/10 text-destructive",
};

export default function DealsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: deals, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("*, accounts(name), contacts(first_name, last_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const deal = {
        user_id: user!.id,
        name: formData.get("name") as string,
        amount: parseFloat(formData.get("amount") as string) || null,
        stage: formData.get("stage") as string || "Qualification",
        probability: parseInt(formData.get("probability") as string) || 10,
        close_date: (formData.get("close_date") as string) || null,
        description: formData.get("description") as string,
      };
      if (editing) {
        const { error } = await supabase.from("deals").update(deal).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("deals").insert(deal);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      setIsOpen(false);
      setEditing(null);
      toast.success(editing ? "Deal updated" : "Deal created");
    },
    onError: () => toast.error("Failed to save deal"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted");
    },
  });

  // Group by stage for kanban-like view
  const grouped = STAGES.map((stage) => ({
    stage,
    deals: deals?.filter((d) => d.stage === stage) ?? [],
  }));

  return (
    <AppLayout
      title="Deals"
      actions={
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Deal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Deal" : "New Deal"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div><Label>Deal Name *</Label><Input name="name" required defaultValue={editing?.name} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input name="amount" type="number" step="0.01" defaultValue={editing?.amount} /></div>
                <div><Label>Probability %</Label><Input name="probability" type="number" min="0" max="100" defaultValue={editing?.probability ?? 10} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stage</Label>
                  <select name="stage" defaultValue={editing?.stage || "Qualification"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><Label>Close Date</Label><Input name="close_date" type="date" defaultValue={editing?.close_date} /></div>
              </div>
              <div><Label>Description</Label><Input name="description" defaultValue={editing?.description} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading deals...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {grouped.map(({ stage, deals: stageDeals }) => (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={stageColors[stage] || ""} variant="secondary">{stage}</Badge>
                <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
              </div>
              {stageDeals.length === 0 ? (
                <div className="bg-card rounded-lg p-4 border border-dashed border-border text-center text-xs text-muted-foreground">
                  No deals
                </div>
              ) : (
                stageDeals.map((deal) => (
                  <div key={deal.id} className="bg-card rounded-lg p-4 crm-shadow-card hover:crm-shadow-card-hover transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground">{deal.name}</h4>
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditing(deal); setIsOpen(true); }}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(deal.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {deal.amount && (
                      <div className="flex items-center gap-1 text-sm font-semibold text-success mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {deal.amount.toLocaleString()}
                      </div>
                    )}
                    {deal.close_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(deal.close_date), "MMM d, yyyy")}
                      </div>
                    )}
                    {deal.accounts?.name && (
                      <div className="text-xs text-muted-foreground mt-1">{deal.accounts.name}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
