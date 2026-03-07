import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone as PhoneIcon, Building2, Trash2, Edit, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CsvImportExport } from "@/components/CsvImportExport";

const CONTACT_FIELDS = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name", required: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "mobile", label: "Mobile" },
  { key: "title", label: "Title" },
  { key: "department", label: "Department" },
  { key: "mailing_address", label: "Address" },
];

const LEAD_SOURCES = ["Web", "Referral", "Cold Call", "Email Campaign", "Social Media", "Trade Show"];

export default function ContactsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", search, sourceFilter],
    queryFn: async () => {
      let query = supabase.from("contacts").select("*, accounts(name)").order("created_at", { ascending: false });
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (sourceFilter !== "all") query = query.eq("lead_source", sourceFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const contact = {
        user_id: user!.id,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        mobile: formData.get("mobile") as string,
        title: formData.get("title") as string,
        department: formData.get("department") as string,
        lead_source: formData.get("lead_source") as string || null,
        mailing_address: formData.get("mailing_address") as string || null,
      };
      if (editingContact) {
        const { error } = await supabase.from("contacts").update(contact).eq("id", editingContact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contacts").insert(contact);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setIsOpen(false);
      setEditingContact(null);
      toast.success(editingContact ? "Contact updated" : "Contact created");
    },
    onError: () => toast.error("Failed to save contact"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted");
    },
  });

  const handleCsvImport = async (records: Record<string, string>[]) => {
    const rows = records.map((r) => ({ ...r, user_id: user!.id }));
    const { error } = await supabase.from("contacts").insert(rows as any);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
  };

  return (
    <AppLayout
      title="Contacts"
      actions={
        <div className="flex items-center gap-2">
          <CsvImportExport module="contacts" fields={CONTACT_FIELDS} data={contacts ?? []} onImport={handleCsvImport} />
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditingContact(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingContact ? "Edit Contact" : "New Contact"}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input name="first_name" defaultValue={editingContact?.first_name} /></div>
                  <div><Label>Last Name *</Label><Input name="last_name" required defaultValue={editingContact?.last_name} /></div>
                </div>
                <div><Label>Email</Label><Input name="email" type="email" defaultValue={editingContact?.email} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Phone</Label><Input name="phone" defaultValue={editingContact?.phone} /></div>
                  <div><Label>Mobile</Label><Input name="mobile" defaultValue={editingContact?.mobile} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Title</Label><Input name="title" defaultValue={editingContact?.title} /></div>
                  <div><Label>Department</Label><Input name="department" defaultValue={editingContact?.department} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lead Source</Label>
                    <select name="lead_source" defaultValue={editingContact?.lead_source || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select...</option>
                      {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><Label>Address</Label><Input name="mailing_address" defaultValue={editingContact?.mailing_address} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {editingContact ? "Update" : "Create"} Contact
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
            <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-card rounded-lg crm-shadow-card">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Source:</span>
              {["all", ...LEAD_SOURCES].map((s) => (
                <Button key={s} size="sm" variant={sourceFilter === s ? "default" : "outline"} onClick={() => setSourceFilter(s)} className="text-xs h-7">
                  {s === "all" ? "All" : s}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl crm-shadow-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Title</TableHead>
                <TableHead className="hidden lg:table-cell">Account</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : contacts?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts yet. Add your first contact!</TableCell></TableRow>
              ) : (
                contacts?.map((c) => (
                  <TableRow key={c.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <TableCell className="font-medium text-primary hover:underline">
                      {c.first_name} {c.last_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.email && <span className="flex items-center gap-1.5 text-sm"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{c.email}</span>}
                    </TableCell>
                    <TableCell>
                      {(c.phone || c.mobile) && (
                        <a href={`tel:${c.mobile || c.phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          <PhoneIcon className="w-3.5 h-3.5" />{c.mobile || c.phone}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{c.title}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.accounts?.name && <Badge variant="secondary" className="gap-1"><Building2 className="w-3 h-3" />{c.accounts.name}</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingContact(c); setIsOpen(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
