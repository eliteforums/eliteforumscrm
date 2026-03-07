import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Edit, PhoneCall, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow, format } from "date-fns";

const CALL_PURPOSES = ["Prospecting", "Follow-up", "Support", "Demo", "Negotiation", "Administrative"];

export default function CallsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: calls, isLoading } = useQuery({
    queryKey: ["calls-list", search],
    queryFn: async () => {
      let query = supabase.from("calls").select("*, contacts(first_name, last_name)").order("call_start_time", { ascending: false });
      if (search) query = query.ilike("subject", `%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts-for-calls"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("id, first_name, last_name");
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const call = {
        user_id: user!.id,
        subject: formData.get("subject") as string,
        call_type: formData.get("call_type") as string || "Outbound",
        call_purpose: formData.get("call_purpose") as string,
        call_result: formData.get("call_result") as string,
        call_duration: parseInt(formData.get("call_duration") as string) || 0,
        contact_id: (formData.get("contact_id") as string) || null,
        description: formData.get("description") as string,
        status: formData.get("status") as string || "Completed",
      };
      if (editing) {
        const { error } = await supabase.from("calls").update(call).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("calls").insert(call);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls-list"] });
      queryClient.invalidateQueries({ queryKey: ["calls-count"] });
      queryClient.invalidateQueries({ queryKey: ["recent-calls"] });
      setIsOpen(false);
      setEditing(null);
      toast.success(editing ? "Call updated" : "Call logged");
    },
    onError: () => toast.error("Failed to save call"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calls").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls-list"] });
      toast.success("Call deleted");
    },
  });

  const formatDuration = (seconds: number) => {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <AppLayout
      title="Call Logs"
      actions={
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Log Call</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit Call" : "Log New Call"}</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div><Label>Subject *</Label><Input name="subject" required defaultValue={editing?.subject} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <select name="call_type" defaultValue={editing?.call_type || "Outbound"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="Outbound">Outbound</option>
                    <option value="Inbound">Inbound</option>
                  </select>
                </div>
                <div>
                  <Label>Purpose</Label>
                  <select name="call_purpose" defaultValue={editing?.call_purpose || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select...</option>
                    {CALL_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
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
                  <Label>Duration (seconds)</Label>
                  <Input name="call_duration" type="number" min="0" defaultValue={editing?.call_duration ?? 0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Result</Label>
                  <Input name="call_result" defaultValue={editing?.call_result} />
                </div>
                <div>
                  <Label>Status</Label>
                  <select name="status" defaultValue={editing?.status || "Completed"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div><Label>Notes</Label><Textarea name="description" rows={3} defaultValue={editing?.description} /></div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Log"} Call</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search calls..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="bg-card rounded-xl crm-shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : calls?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No calls logged yet.</TableCell></TableRow>
              ) : (
                calls?.map((call) => (
                  <TableRow key={call.id} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-primary" />
                        {call.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={call.call_type === "Inbound" ? "bg-success/10 text-success" : "bg-info/10 text-info"}>
                        {call.call_type === "Inbound" ? <PhoneIncoming className="w-3 h-3 mr-1" /> : <PhoneOutgoing className="w-3 h-3 mr-1" />}
                        {call.call_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {call.contacts ? `${call.contacts.first_name ?? ""} ${call.contacts.last_name}` : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{call.call_purpose || "-"}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDuration(call.call_duration ?? 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(call.call_start_time), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={call.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(call); setIsOpen(true); }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(call.id)}>
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
