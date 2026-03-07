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
import { Plus, Search, Mail, Phone as PhoneIcon, Building2, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function ContactsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", search],
    queryFn: async () => {
      let query = supabase.from("contacts").select("*, accounts(name)").order("created_at", { ascending: false });
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate(new FormData(e.currentTarget));
  };

  return (
    <AppLayout
      title="Contacts"
      actions={
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditingContact(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingContact ? "Edit Contact" : "New Contact"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input name="first_name" defaultValue={editingContact?.first_name} />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input name="last_name" required defaultValue={editingContact?.last_name} />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={editingContact?.email} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" defaultValue={editingContact?.phone} />
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input name="mobile" defaultValue={editingContact?.mobile} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input name="title" defaultValue={editingContact?.title} />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input name="department" defaultValue={editingContact?.department} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {editingContact ? "Update" : "Create"} Contact
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="bg-card rounded-xl crm-shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Account</TableHead>
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
                  <TableRow key={c.id} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">
                      {c.first_name} {c.last_name}
                    </TableCell>
                    <TableCell>
                      {c.email && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          {c.email}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(c.phone || c.mobile) && (
                        <a href={`tel:${c.mobile || c.phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                          <PhoneIcon className="w-3.5 h-3.5" />
                          {c.mobile || c.phone}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.title}</TableCell>
                    <TableCell>
                      {c.accounts?.name && (
                        <Badge variant="secondary" className="gap-1">
                          <Building2 className="w-3 h-3" />
                          {c.accounts.name}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingContact(c); setIsOpen(true); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(c.id)}>
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
