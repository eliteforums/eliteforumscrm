import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Edit, Globe, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AccountsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts", search],
    queryFn: async () => {
      let query = supabase.from("accounts").select("*").order("created_at", { ascending: false });
      if (search) query = query.ilike("name", `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const account = {
        user_id: user!.id,
        name: formData.get("name") as string,
        industry: formData.get("industry") as string,
        website: formData.get("website") as string,
        phone: formData.get("phone") as string,
        employees: parseInt(formData.get("employees") as string) || null,
        description: formData.get("description") as string,
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

  return (
    <AppLayout
      title="Accounts"
      actions={
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Account" : "New Account"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div><Label>Company Name *</Label><Input name="name" required defaultValue={editing?.name} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Industry</Label><Input name="industry" defaultValue={editing?.industry} /></div>
                <div><Label>Employees</Label><Input name="employees" type="number" defaultValue={editing?.employees} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Website</Label><Input name="website" defaultValue={editing?.website} /></div>
                <div><Label>Phone</Label><Input name="phone" defaultValue={editing?.phone} /></div>
              </div>
              <div><Label>Description</Label><Input name="description" defaultValue={editing?.description} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="bg-card rounded-xl crm-shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : accounts?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No accounts yet.</TableCell></TableRow>
              ) : (
                accounts?.map((a) => (
                  <TableRow key={a.id} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.industry}</TableCell>
                    <TableCell>
                      {a.website && (
                        <a href={a.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Globe className="w-3.5 h-3.5" />{a.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{a.phone}</TableCell>
                    <TableCell>
                      {a.employees && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="w-3.5 h-3.5" />{a.employees}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
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
