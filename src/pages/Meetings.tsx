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
import { Plus, Calendar, Clock, MapPin, Users, Trash2, Edit, Video } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const MEETING_TYPES = ["Meeting", "Call", "Demo", "Webinar", "Lunch"];
const STATUSES = ["Scheduled", "Completed", "Cancelled", "Rescheduled"];

const statusColors: Record<string, string> = {
  Scheduled: "bg-info/10 text-info",
  Completed: "bg-success/10 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
  Rescheduled: "bg-warning/10 text-warning",
};

export default function MeetingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const { data: meetings, isLoading } = useQuery({
    queryKey: ["meetings", filter],
    queryFn: async () => {
      let q = supabase.from("meetings").select("*, contacts(first_name, last_name), deals(name)").order("start_time", { ascending: true });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts-for-meetings"],
    queryFn: async () => { const { data } = await supabase.from("contacts").select("id, first_name, last_name"); return data ?? []; },
  });

  const { data: deals } = useQuery({
    queryKey: ["deals-for-meetings"],
    queryFn: async () => { const { data } = await supabase.from("deals").select("id, name"); return data ?? []; },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const meeting = {
        user_id: user!.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        location: formData.get("location") as string || null,
        start_time: formData.get("start_time") as string,
        end_time: (formData.get("end_time") as string) || null,
        meeting_type: formData.get("meeting_type") as string || "Meeting",
        status: formData.get("status") as string || "Scheduled",
        contact_id: (formData.get("contact_id") as string) || null,
        deal_id: (formData.get("deal_id") as string) || null,
      };
      if (editing) {
        const { error } = await supabase.from("meetings").update(meeting).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("meetings").insert(meeting);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setIsOpen(false); setEditing(null);
      toast.success(editing ? "Meeting updated" : "Meeting scheduled");
    },
    onError: () => toast.error("Failed to save meeting"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["meetings"] }); toast.success("Meeting deleted"); },
  });

  const now = new Date();
  const upcoming = meetings?.filter((m) => new Date(m.start_time) >= now && m.status === "Scheduled") ?? [];
  const past = meetings?.filter((m) => new Date(m.start_time) < now || m.status !== "Scheduled") ?? [];

  return (
    <AppLayout title="Meetings" actions={
      <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Schedule Meeting</Button></DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
            <div><Label>Title *</Label><Input name="title" required defaultValue={editing?.title} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Time *</Label><Input name="start_time" type="datetime-local" required defaultValue={editing?.start_time?.slice(0, 16)} /></div>
              <div><Label>End Time</Label><Input name="end_time" type="datetime-local" defaultValue={editing?.end_time?.slice(0, 16)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <select name="meeting_type" defaultValue={editing?.meeting_type || "Meeting"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {MEETING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><Label>Status</Label>
                <select name="status" defaultValue={editing?.status || "Scheduled"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Location</Label><Input name="location" defaultValue={editing?.location} placeholder="Office, Zoom link, etc." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Contact</Label>
                <select name="contact_id" defaultValue={editing?.contact_id || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">None</option>
                  {contacts?.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div><Label>Deal</Label>
                <select name="deal_id" defaultValue={editing?.deal_id || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">None</option>
                  {deals?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea name="description" rows={3} defaultValue={editing?.description} /></div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Schedule"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    }>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {["all", ...STATUSES].map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="text-xs capitalize">
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>

        {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : (
          <>
            {upcoming.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Upcoming</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((m) => (
                    <MeetingCard key={m.id} meeting={m} onEdit={() => { setEditing(m); setIsOpen(true); }} onDelete={() => deleteMutation.mutate(m.id)} />
                  ))}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Past & Other</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map((m) => (
                    <MeetingCard key={m.id} meeting={m} onEdit={() => { setEditing(m); setIsOpen(true); }} onDelete={() => deleteMutation.mutate(m.id)} />
                  ))}
                </div>
              </div>
            )}
            {meetings?.length === 0 && (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground crm-shadow-card">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
                No meetings scheduled. Schedule your first meeting!
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function MeetingCard({ meeting, onEdit, onDelete }: { meeting: any; onEdit: () => void; onDelete: () => void }) {
  const m = meeting;
  return (
    <div className="bg-card rounded-xl p-4 crm-shadow-card hover:crm-shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Badge className={statusColors[m.status] || ""} variant="secondary">{m.status}</Badge>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}><Edit className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onDelete}><Trash2 className="w-3 h-3" /></Button>
        </div>
      </div>
      <h4 className="font-medium text-sm text-foreground mb-1">{m.title}</h4>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{format(new Date(m.start_time), "MMM d, yyyy 'at' h:mm a")}</p>
        {m.location && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{m.location}</p>}
        {m.contacts && <p className="flex items-center gap-1.5"><Users className="w-3 h-3" />{m.contacts.first_name} {m.contacts.last_name}</p>}
        <Badge variant="secondary" className="text-xs mt-1">{m.meeting_type}</Badge>
      </div>
    </div>
  );
}
