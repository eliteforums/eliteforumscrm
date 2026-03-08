import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, Trash2, Edit, Search, Filter, Building2, Users, Sparkles, Loader2 } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: deals, isLoading } = useQuery({
    queryKey: ["deals", search, stageFilter],
    queryFn: async () => {
      let query = supabase.from("deals").select("*, accounts(name), contacts(first_name, last_name)").order("created_at", { ascending: false });
      if (search) query = query.ilike("name", `%${search}%`);
      if (stageFilter !== "all") query = query.eq("stage", stageFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts-for-deals"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("id, first_name, last_name");
      return data ?? [];
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ["accounts-for-deals"],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("id, name");
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const deal: any = {
        user_id: user!.id,
        name: formData.get("name") as string,
        amount: parseFloat(formData.get("amount") as string) || null,
        stage: formData.get("stage") as string || "Qualification",
        probability: parseInt(formData.get("probability") as string) || 10,
        close_date: (formData.get("close_date") as string) || null,
        description: formData.get("description") as string || null,
        contact_id: (formData.get("contact_id") as string) || null,
        account_id: (formData.get("account_id") as string) || null,
        lead_source: (formData.get("lead_source") as string) || null,
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

  // AI Deal Insights
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getAiInsights = async () => {
    if (!deals?.length) { toast.error("No deals to analyze"); return; }
    setAiLoading(true);
    try {
      const summary = deals.map(d => `${d.name}: $${d.amount || 0}, Stage: ${d.stage}, Prob: ${d.probability}%`).join("\n");
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: [{ role: "user", content: `Analyze this deal pipeline and give 3 actionable insights in bullet points. Be concise:\n${summary}` }] },
      });
      if (error) throw error;
      // For non-streaming response, parse the text
      const text = typeof data === "string" ? data : data?.choices?.[0]?.message?.content || "Unable to generate insights.";
      setAiInsight(text);
    } catch (e: any) {
      toast.error("AI insights unavailable");
    } finally {
      setAiLoading(false);
    }
  };

  // Group by stage for kanban view
  const displayStages = stageFilter !== "all" ? [stageFilter] : STAGES;
  const grouped = displayStages.map((stage) => ({
    stage,
    deals: deals?.filter((d) => d.stage === stage) ?? [],
  }));

  return (
    <AppLayout
      title="Deals"
      actions={
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={getAiInsights} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">AI Insights</span>
          </Button>
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Deal</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact</Label>
                  <select name="contact_id" defaultValue={editing?.contact_id || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">None</option>
                    {contacts?.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Account</Label>
                  <select name="account_id" defaultValue={editing?.account_id || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">None</option>
                    {accounts?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label>Lead Source</Label>
                <select name="lead_source" defaultValue={editing?.lead_source || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select...</option>
                  {["Web", "Referral", "Cold Call", "Email Campaign", "Social Media", "Trade Show"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><Label>Description</Label><Textarea name="description" defaultValue={editing?.description} rows={3} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-card rounded-lg crm-shadow-card">
            <span className="text-xs text-muted-foreground">Stage:</span>
            {["all", ...STAGES].map((s) => (
              <Button key={s} size="sm" variant={stageFilter === s ? "default" : "outline"} onClick={() => setStageFilter(s)} className="text-xs h-7">
                {s === "all" ? "All" : s}
              </Button>
            ))}
          </div>
        )}

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
                      {deal.contacts && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Users className="w-3 h-3" />{deal.contacts.first_name} {deal.contacts.last_name}
                        </div>
                      )}
                      {deal.accounts?.name && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Building2 className="w-3 h-3" />{deal.accounts.name}
                        </div>
                      )}
                      {deal.probability != null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                            <span>Probability</span>
                            <span>{deal.probability}%</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${deal.probability}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
