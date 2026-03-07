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
import { Plus, Mail, Send, Inbox, Trash2, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export default function EmailsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: emails, isLoading } = useQuery({
    queryKey: ["emails", search, filter],
    queryFn: async () => {
      let q = supabase.from("emails").select("*, contacts(first_name, last_name)").order("sent_at", { ascending: false });
      if (search) q = q.or(`subject.ilike.%${search}%,to_address.ilike.%${search}%`);
      if (filter !== "all") q = q.eq("direction", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts-for-emails"],
    queryFn: async () => { const { data } = await supabase.from("contacts").select("id, first_name, last_name, email"); return data ?? []; },
  });

  const sendMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const email = {
        user_id: user!.id,
        subject: formData.get("subject") as string,
        body: formData.get("body") as string,
        to_address: formData.get("to_address") as string,
        from_address: user!.email || "",
        direction: "Outbound",
        status: "Sent",
        contact_id: (formData.get("contact_id") as string) || null,
      };
      const { error } = await supabase.from("emails").insert(email);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      setIsOpen(false);
      toast.success("Email logged");
    },
    onError: () => toast.error("Failed to log email"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emails").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["emails"] }); toast.success("Email deleted"); },
  });

  return (
    <AppLayout title="Emails" actions={
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Log Email</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Email</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); sendMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
            <div><Label>To *</Label><Input name="to_address" type="email" required placeholder="recipient@company.com" /></div>
            <div><Label>Subject *</Label><Input name="subject" required placeholder="Email subject" /></div>
            <div><Label>Link to Contact</Label>
              <select name="contact_id" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">None</option>
                {contacts?.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>)}
              </select>
            </div>
            <div><Label>Body</Label><Textarea name="body" rows={5} placeholder="Email content..." /></div>
            <Button type="submit" className="w-full gap-2" disabled={sendMutation.isPending}><Send className="w-4 h-4" /> Log Email</Button>
          </form>
        </DialogContent>
      </Dialog>
    }>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search emails..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["all", "Outbound", "Inbound"].map((d) => (
              <Button key={d} size="sm" variant={filter === d ? "default" : "outline"} onClick={() => setFilter(d)} className="text-xs">
                {d === "all" ? "All" : d}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : emails?.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center text-muted-foreground crm-shadow-card">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            No emails logged yet. Log your first email!
          </div>
        ) : (
          <div className="space-y-2">
            {emails?.map((email) => (
              <div key={email.id} className="bg-card rounded-lg p-4 crm-shadow-card hover:crm-shadow-card-hover transition-shadow flex items-start gap-3">
                <div className={`p-2 rounded-lg ${email.direction === "Inbound" ? "bg-success/10" : "bg-info/10"}`}>
                  {email.direction === "Inbound" ? <Inbox className="w-4 h-4 text-success" /> : <Send className="w-4 h-4 text-info" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{email.subject}</span>
                    <Badge variant="secondary" className="text-xs">{email.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {email.direction === "Outbound" ? `To: ${email.to_address}` : `From: ${email.from_address}`}
                    {email.contacts && ` · ${email.contacts.first_name} ${email.contacts.last_name}`}
                  </p>
                  {email.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{email.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatDistanceToNow(new Date(email.sent_at), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(email.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
