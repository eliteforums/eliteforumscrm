import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Edit, ArrowRightLeft, Filter, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CsvImportExport } from "@/components/CsvImportExport";

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Unqualified", "Converted"];
const LEAD_SOURCES = ["Web", "Referral", "Cold Call", "Email Campaign", "Social Media", "Trade Show"];

const statusColors: Record<string, string> = {
  New: "bg-info/10 text-info",
  Contacted: "bg-primary/10 text-primary",
  Qualified: "bg-success/10 text-success",
  Unqualified: "bg-destructive/10 text-destructive",
  Converted: "bg-accent/10 text-accent",
};

const LEAD_FIELDS = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name", required: true },
  { key: "company", label: "Company", required: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "title", label: "Title" },
  { key: "lead_source", label: "Lead Source" },
  { key: "industry", label: "Industry" },
  { key: "annual_revenue", label: "Annual Revenue" },
];

// Lead scoring function
function calculateLeadScore(lead: any): number {
  let score = 0;
  // Title-based scoring
  const title = (lead.title || "").toLowerCase();
  if (title.includes("ceo") || title.includes("founder") || title.includes("owner")) score += 25;
  else if (title.includes("vp") || title.includes("director") || title.includes("head")) score += 20;
  else if (title.includes("manager") || title.includes("lead")) score += 15;
  else if (title) score += 5;
  // Revenue scoring
  if (lead.annual_revenue > 1000000) score += 25;
  else if (lead.annual_revenue > 500000) score += 20;
  else if (lead.annual_revenue > 100000) score += 15;
  else if (lead.annual_revenue > 0) score += 5;
  // Source scoring
  if (lead.lead_source === "Referral") score += 20;
  else if (lead.lead_source === "Web") score += 15;
  else if (lead.lead_source === "Trade Show") score += 10;
  else if (lead.lead_source) score += 5;
  // Email presence
  if (lead.email) score += 10;
  if (lead.phone) score += 5;
  // Decay: -10 for leads older than 30 days
  const age = (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (age > 30) score -= 10;
  if (age > 60) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export default function LeadsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", search, statusFilter, sourceFilter],
    queryFn: async () => {
      let query = supabase.from("leads").select("*").eq("converted", false).order("created_at", { ascending: false });
      if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%`);
      if (statusFilter !== "all") query = query.eq("lead_status", statusFilter);
      if (sourceFilter !== "all") query = query.eq("lead_source", sourceFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const lead = {
        user_id: user!.id,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        company: formData.get("company") as string,
        title: formData.get("title") as string,
        lead_source: formData.get("lead_source") as string,
        lead_status: formData.get("lead_status") as string || "New",
        industry: formData.get("industry") as string,
        annual_revenue: parseFloat(formData.get("annual_revenue") as string) || null,
      };
      if (editingLead) {
        const { error } = await supabase.from("leads").update(lead).eq("id", editingLead.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("leads").insert(lead);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsOpen(false); setEditingLead(null);
      toast.success(editingLead ? "Lead updated" : "Lead created");
    },
    onError: () => toast.error("Failed to save lead"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted");
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (lead: any) => {
      // Create Account
      const { data: account, error: accErr } = await supabase.from("accounts").insert({
        user_id: user!.id, name: lead.company, industry: lead.industry,
        annual_revenue: lead.annual_revenue,
      }).select().single();
      if (accErr) throw accErr;
      // Create Contact
      const { data: contact, error: conErr } = await supabase.from("contacts").insert({
        user_id: user!.id, first_name: lead.first_name, last_name: lead.last_name,
        email: lead.email, phone: lead.phone, title: lead.title,
        account_id: account.id, lead_source: lead.lead_source,
      }).select().single();
      if (conErr) throw conErr;
      // Optionally create a Deal/Opportunity
      const { error: dealErr } = await supabase.from("deals").insert({
        user_id: user!.id,
        name: `${lead.company} - Opportunity`,
        stage: "Qualification",
        contact_id: contact.id,
        account_id: account.id,
        lead_source: lead.lead_source,
      });
      if (dealErr) throw dealErr;
      // Update Lead as converted
      const { error: updErr } = await supabase.from("leads").update({
        converted: true, lead_status: "Converted",
        converted_account_id: account.id, converted_contact_id: contact.id,
      }).eq("id", lead.id);
      if (updErr) throw updErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Lead converted to Contact + Account + Deal!");
    },
    onError: () => toast.error("Conversion failed"),
  });

  // Auto-score leads
  const scoreMutation = useMutation({
    mutationFn: async () => {
      if (!leads?.length) return;
      const updates = leads.map((l) => ({ id: l.id, score: calculateLeadScore(l) }));
      for (const u of updates) {
        await supabase.from("leads").update({ score: u.score }).eq("id", u.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead scores updated!");
    },
  });

  const handleCsvImport = async (records: Record<string, string>[]) => {
    const rows = records.map((r) => ({
      ...r, user_id: user!.id,
      annual_revenue: r.annual_revenue ? parseFloat(r.annual_revenue) : null,
    }));
    const { error } = await supabase.from("leads").insert(rows as any);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  return (
    <AppLayout
      title="Leads"
      actions={
        <div className="flex items-center gap-2 whitespace-nowrap">
          <CsvImportExport module="leads" fields={LEAD_FIELDS} data={leads ?? []} onImport={handleCsvImport} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => scoreMutation.mutate()} disabled={scoreMutation.isPending}>
            <Zap className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Score</span><span className="sm:hidden">AI</span>
          </Button>
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditingLead(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Lead</span><span className="sm:hidden">Add</span></Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingLead ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input name="first_name" defaultValue={editingLead?.first_name} /></div>
                  <div><Label>Last Name *</Label><Input name="last_name" required defaultValue={editingLead?.last_name} /></div>
                </div>
                <div><Label>Company *</Label><Input name="company" required defaultValue={editingLead?.company} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Email</Label><Input name="email" type="email" defaultValue={editingLead?.email} /></div>
                  <div><Label>Phone</Label><Input name="phone" defaultValue={editingLead?.phone} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Title</Label><Input name="title" defaultValue={editingLead?.title} /></div>
                  <div><Label>Industry</Label><Input name="industry" defaultValue={editingLead?.industry} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Lead Source</Label>
                    <select name="lead_source" defaultValue={editingLead?.lead_source || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select...</option>
                      {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select name="lead_status" defaultValue={editingLead?.lead_status || "New"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label>Annual Revenue</Label><Input name="annual_revenue" type="number" step="0.01" defaultValue={editingLead?.annual_revenue} /></div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {editingLead ? "Update" : "Create"} Lead
                </Button>
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
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-col gap-3 p-3 bg-card rounded-lg crm-shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              {["all", ...LEAD_STATUSES].map((s) => (
                <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatusFilter(s)} className="text-xs h-7">{s === "all" ? "All" : s}</Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Source:</span>
              {["all", ...LEAD_SOURCES].map((s) => (
                <Button key={s} size="sm" variant={sourceFilter === s ? "default" : "outline"} onClick={() => setSourceFilter(s)} className="text-xs h-7">{s === "all" ? "All" : s}</Button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl crm-shadow-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Score</TableHead>
                <TableHead className="hidden lg:table-cell">Source</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : leads?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leads yet.</TableCell></TableRow>
              ) : (
                leads?.map((l) => {
                  const score = l.score ?? calculateLeadScore(l);
                  return (
                    <TableRow key={l.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{l.first_name} {l.last_name}</TableCell>
                      <TableCell>{l.company}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[l.lead_status] || ""} variant="secondary">{l.lead_status}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-destructive"}`}
                              style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{score}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{l.lead_source}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{l.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {l.lead_status === "Qualified" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => convertMutation.mutate(l)} title="Convert">
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingLead(l); setIsOpen(true); }}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(l.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
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
