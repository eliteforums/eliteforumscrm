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
import { Plus, Search, Trash2, Edit, Globe, Users, Building2, DollarSign, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CsvImportExport } from "@/components/CsvImportExport";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Education", "Consulting", "Real Estate"];

const ACCOUNT_FIELDS = [
  { key: "name", label: "Company Name", required: true },
  { key: "industry", label: "Industry" },
  { key: "website", label: "Website" },
  { key: "phone", label: "Phone" },
  { key: "employees", label: "Employees" },
  { key: "annual_revenue", label: "Annual Revenue" },
  { key: "billing_address", label: "Billing Address" },
  { key: "description", label: "Description" },
];

export default function AccountsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [industryFilter, setIndustryFilter] = useState("all");

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts", search, industryFilter],
    queryFn: async () => {
      let query = supabase.from("accounts").select("*").order("created_at", { ascending: false });
      if (search) query = query.ilike("name", `%${search}%`);
      if (industryFilter !== "all") query = query.eq("industry", industryFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: allAccounts } = useQuery({
    queryKey: ["accounts-for-parent"],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("id, name");
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const account: any = {
        user_id: user!.id,
        name: formData.get("name") as string,
        industry: formData.get("industry") as string || null,
        website: formData.get("website") as string || null,
        phone: formData.get("phone") as string || null,
        employees: parseInt(formData.get("employees") as string) || null,
        annual_revenue: parseFloat(formData.get("annual_revenue") as string) || null,
        billing_address: formData.get("billing_address") as string || null,
        description: formData.get("description") as string || null,
        parent_account_id: (formData.get("parent_account_id") as string) || null,
      };
      if (editing) {
        const { error } = await supabase.from("accounts").update(account).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("accounts").insert(account);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setIsOpen(false);
      setEditing(null);
      toast.success(editing ? "Account updated" : "Account created");
    },
    onError: () => toast.error("Failed to save account"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted");
    },
  });

  const handleCsvImport = async (records: Record<string, string>[]) => {
    const rows = records.map((r) => ({
      ...r, user_id: user!.id,
      employees: r.employees ? parseInt(r.employees) : null,
      annual_revenue: r.annual_revenue ? parseFloat(r.annual_revenue) : null,
    }));
    const { error } = await supabase.from("accounts").insert(rows as any);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };

  return (
    <AppLayout
      title="Accounts"
      actions={
        <div className="flex items-center gap-2 whitespace-nowrap">
          <CsvImportExport module="accounts" fields={ACCOUNT_FIELDS} data={accounts ?? []} onImport={handleCsvImport} />
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Account</span><span className="sm:hidden">Add</span></Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? "Edit Account" : "New Account"}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
                <div><Label>Company Name *</Label><Input name="name" required defaultValue={editing?.name} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Industry</Label>
                    <select name="industry" defaultValue={editing?.industry || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select...</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div><Label>Employees</Label><Input name="employees" type="number" defaultValue={editing?.employees} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Website</Label><Input name="website" defaultValue={editing?.website} /></div>
                  <div><Label>Phone</Label><Input name="phone" defaultValue={editing?.phone} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Annual Revenue</Label><Input name="annual_revenue" type="number" step="0.01" defaultValue={editing?.annual_revenue} /></div>
                  <div>
                    <Label>Parent Account</Label>
                    <select name="parent_account_id" defaultValue={editing?.parent_account_id || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">None</option>
                      {allAccounts?.filter((a) => a.id !== editing?.id).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label>Billing Address</Label><Input name="billing_address" defaultValue={editing?.billing_address} /></div>
                <div><Label>Description</Label><Input name="description" defaultValue={editing?.description} /></div>
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
            <Input placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-card rounded-lg crm-shadow-card">
            <span className="text-xs text-muted-foreground">Industry:</span>
            {["all", ...INDUSTRIES].map((s) => (
              <Button key={s} size="sm" variant={industryFilter === s ? "default" : "outline"} onClick={() => setIndustryFilter(s)} className="text-xs h-7">
                {s === "all" ? "All" : s}
              </Button>
            ))}
          </div>
        )}

        <div className="bg-card rounded-xl crm-shadow-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="hidden sm:table-cell">Industry</TableHead>
                <TableHead className="hidden md:table-cell">Website</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                <TableHead className="hidden lg:table-cell">Employees</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : accounts?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No accounts yet.</TableCell></TableRow>
              ) : (
                accounts?.map((a) => (
                  <TableRow key={a.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => navigate(`/accounts/${a.id}`)}>
                    <TableCell className="font-medium text-primary hover:underline">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        {a.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {a.industry && <Badge variant="secondary" className="text-xs">{a.industry}</Badge>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {a.website && (
                        <a href={a.website.startsWith("http") ? a.website : `https://${a.website}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          <Globe className="w-3.5 h-3.5" />{a.website.replace(/^https?:\/\//, "").slice(0, 25)}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{a.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {a.annual_revenue && <span className="flex items-center gap-1 text-success"><DollarSign className="w-3 h-3" />{Number(a.annual_revenue).toLocaleString()}</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {a.employees && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="w-3.5 h-3.5" />{a.employees}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(a); setIsOpen(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
