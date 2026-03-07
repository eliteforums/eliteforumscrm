import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Unqualified", "Converted"];
const LEAD_SOURCES = ["Web", "Referral", "Cold Call", "Email Campaign", "Social Media", "Trade Show"];

const statusColors: Record<string, string> = {
  New: "bg-info/10 text-info",
  Contacted: "bg-primary/10 text-primary",
  Qualified: "bg-success/10 text-success",
  Unqualified: "bg-destructive/10 text-destructive",
  Converted: "bg-accent/10 text-accent",
};

export default function LeadsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", search],
    queryFn: async () => {
      let query = supabase.from("leads").select("*").eq("converted", false).order("created_at", { ascending: false });
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%`);
      }
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
      setIsOpen(false);
      setEditingLead(null);
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
      }).select().single();
      if (accErr) throw accErr;

      // Create Contact
      const { data: contact, error: conErr } = await supabase.from("contacts").insert({
        user_id: user!.id, first_name: lead.first_name, last_name: lead.last_name,
        email: lead.email, phone: lead.phone, title: lead.title,
        account_id: account.id, lead_source: lead.lead_source,
      }).select().single();
      if (conErr) throw conErr;

      // Mark lead as converted
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
      toast.success("Lead converted to Contact + Account!");
    },
    onError: () => toast.error("Conversion failed"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate(new FormData(e.currentTarget));
  };

  return (
    <AppLayout
      title="Leads"
      actions={
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditingLead(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Lead</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingLead ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input name="first_name" defaultValue={editingLead?.first_name} /></div>
                <div><Label>Last Name *</Label><Input name="last_name" required defaultValue={editingLead?.last_name} /></div>
              </div>
              <div><Label>Company *</Label><Input name="company" required defaultValue={editingLead?.company} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input name="email" type="email" defaultValue={editingLead?.email} /></div>
                <div><Label>Phone</Label><Input name="phone" defaultValue={editingLead?.phone} /></div>
              </div>
              <div><Label>Title</Label><Input name="title" defaultValue={editingLead?.title} /></div>
              <div className="grid grid-cols-2 gap-4">
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
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {editingLead ? "Update" : "Create"} Lead
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="bg-card rounded-xl crm-shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : leads?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No leads yet.</TableCell></TableRow>
              ) : (
                leads?.map((l) => (
                  <TableRow key={l.id} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">{l.first_name} {l.last_name}</TableCell>
                    <TableCell>{l.company}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[l.lead_status] || ""} variant="secondary">{l.lead_status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.lead_source}</TableCell>
                    <TableCell className="text-sm">{l.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingLead(l); setIsOpen(true); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(l.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
