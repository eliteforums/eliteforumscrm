import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Edit, User, Building2, Handshake, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function NotesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notes")
        .select("*, contacts(first_name, last_name), leads(first_name, last_name), accounts(name), deals(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts-for-notes"],
    queryFn: async () => { const { data } = await supabase.from("contacts").select("id, first_name, last_name"); return data ?? []; },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads-for-notes"],
    queryFn: async () => { const { data } = await supabase.from("leads").select("id, first_name, last_name").eq("converted", false); return data ?? []; },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const note = {
        user_id: user!.id,
        content: formData.get("content") as string,
        contact_id: (formData.get("contact_id") as string) || null,
        lead_id: (formData.get("lead_id") as string) || null,
      };
      if (editing) {
        const { error } = await supabase.from("notes").update({ content: note.content }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("notes").insert(note);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsOpen(false); setEditing(null);
      toast.success(editing ? "Note updated" : "Note created");
    },
    onError: () => toast.error("Failed to save note"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notes"] }); toast.success("Note deleted"); },
  });

  const getLinkedEntity = (note: any) => {
    if (note.contacts) return { icon: User, label: `${note.contacts.first_name ?? ""} ${note.contacts.last_name}`, color: "text-primary" };
    if (note.leads) return { icon: UserPlus, label: `${note.leads.first_name ?? ""} ${note.leads.last_name}`, color: "text-accent" };
    if (note.accounts) return { icon: Building2, label: note.accounts.name, color: "text-info" };
    if (note.deals) return { icon: Handshake, label: note.deals.name, color: "text-success" };
    return null;
  };

  return (
    <AppLayout title="Notes" actions={
      <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Note</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Note" : "New Note"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
            <div><Label>Content *</Label><Textarea name="content" rows={5} required defaultValue={editing?.content} /></div>
            {!editing && (
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Link to Contact</Label>
                  <select name="contact_id" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">None</option>
                    {contacts?.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <div><Label>Link to Lead</Label>
                  <select name="lead_id" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">None</option>
                    {leads?.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                  </select>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    }>
      {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes?.length === 0 ? (
            <div className="col-span-full bg-card rounded-xl p-12 text-center text-muted-foreground crm-shadow-card">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No notes yet. Create your first note!
            </div>
          ) : notes?.map((note) => {
            const linked = getLinkedEntity(note);
            return (
              <div key={note.id} className="bg-card rounded-xl p-4 crm-shadow-card hover:crm-shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  {linked ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <linked.icon className={`w-3 h-3 ${linked.color}`} />{linked.label}
                    </Badge>
                  ) : <span />}
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditing(note); setIsOpen(true); }}><Edit className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(note.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
