import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft, Phone, Mail, Building2, MapPin, Briefcase, Clock,
  PhoneCall, PhoneIncoming, PhoneOutgoing, Plus, FileText, Handshake,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { useState, useEffect, useCallback } from "react";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [callWrapOpen, setCallWrapOpen] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  const { data: contact } = useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*, accounts(name)").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: calls } = useQuery({
    queryKey: ["contact-calls", id],
    queryFn: async () => {
      const { data } = await supabase.from("calls").select("*").eq("contact_id", id!).order("call_start_time", { ascending: false });
      return data ?? [];
    },
  });

  const { data: notes } = useQuery({
    queryKey: ["contact-notes", id],
    queryFn: async () => {
      const { data } = await supabase.from("notes").select("*").eq("contact_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: deals } = useQuery({
    queryKey: ["contact-deals", id],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("*").eq("contact_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Click-to-call with Page Visibility API
  const handleClickToCall = useCallback((phone: string) => {
    setCallStartTime(new Date());
    window.location.href = `tel:${phone}`;
  }, []);

  useEffect(() => {
    if (!callStartTime) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && callStartTime) {
        // User returned from call — show wrap-up
        setCallWrapOpen(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [callStartTime]);

  const logCallMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const duration = callStartTime ? Math.floor((Date.now() - callStartTime.getTime()) / 1000) : 0;
      const { error } = await supabase.from("calls").insert({
        user_id: user!.id,
        contact_id: id!,
        subject: formData.get("subject") as string || "Phone call",
        call_type: "Outbound",
        call_result: formData.get("call_result") as string,
        call_duration: duration,
        description: formData.get("description") as string,
        status: "Completed",
        call_start_time: callStartTime?.toISOString() || new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-calls", id] });
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      setCallWrapOpen(false);
      setCallStartTime(null);
      toast.success("Call logged!");
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { error } = await supabase.from("notes").insert({
        user_id: user!.id,
        contact_id: id!,
        content: formData.get("content") as string,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-notes", id] });
      toast.success("Note added");
    },
  });

  if (!contact) return <AppLayout title="Contact"><div className="text-center py-12 text-muted-foreground">Loading...</div></AppLayout>;

  const phone = contact.mobile || contact.phone;

  return (
    <AppLayout title={`${contact.first_name ?? ""} ${contact.last_name}`} actions={
      phone ? (
        <Button size="sm" className="gap-2" onClick={() => handleClickToCall(phone)}>
          <Phone className="w-4 h-4" /> Call
        </Button>
      ) : undefined
    }>
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/contacts")}>
          <ArrowLeft className="w-4 h-4" /> Back to Contacts
        </Button>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-xl p-6 crm-shadow-card lg:col-span-1">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-2xl font-display font-bold text-primary">
              {(contact.first_name?.[0] || "")}{contact.last_name[0]}
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">{contact.first_name} {contact.last_name}</h2>
          {contact.title && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Briefcase className="w-3.5 h-3.5" />{contact.title}</p>}
          {contact.accounts?.name && <p className="text-sm text-muted-foreground flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{contact.accounts.name}</p>}

          <div className="mt-4 space-y-2">
            {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline"><Mail className="w-4 h-4" />{contact.email}</a>}
            {phone && <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline" onClick={(e) => { e.preventDefault(); handleClickToCall(phone); }}><Phone className="w-4 h-4" />{phone}</a>}
            {contact.mailing_address && <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{contact.mailing_address}</p>}
          </div>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="calls">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="calls">Calls ({calls?.length || 0})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes?.length || 0})</TabsTrigger>
              <TabsTrigger value="deals">Deals ({deals?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="calls" className="mt-4 space-y-3">
              {calls?.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground text-sm crm-shadow-card">No calls recorded</div>
              ) : calls?.map((call) => (
                <div key={call.id} className="bg-card rounded-lg p-4 crm-shadow-card flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${call.call_type === "Inbound" ? "bg-success/10" : "bg-info/10"}`}>
                    {call.call_type === "Inbound" ? <PhoneIncoming className="w-4 h-4 text-success" /> : <PhoneOutgoing className="w-4 h-4 text-info" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{call.subject}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      {call.call_duration ? <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor(call.call_duration / 60)}m {call.call_duration % 60}s</span> : null}
                      <span>{format(new Date(call.call_start_time), "MMM d, h:mm a")}</span>
                      {call.call_result && <Badge variant="secondary" className="text-xs">{call.call_result}</Badge>}
                    </div>
                    {call.description && <p className="text-xs text-muted-foreground mt-1">{call.description}</p>}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-3">
              <form onSubmit={(e) => { e.preventDefault(); addNoteMutation.mutate(new FormData(e.currentTarget)); e.currentTarget.reset(); }}
                className="flex gap-2">
                <Textarea name="content" placeholder="Add a note..." className="flex-1" rows={2} required />
                <Button type="submit" size="sm" disabled={addNoteMutation.isPending}><Plus className="w-4 h-4" /></Button>
              </form>
              {notes?.map((note) => (
                <div key={note.id} className="bg-card rounded-lg p-4 crm-shadow-card">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="deals" className="mt-4 space-y-3">
              {deals?.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground text-sm crm-shadow-card">No deals linked</div>
              ) : deals?.map((deal) => (
                <div key={deal.id} className="bg-card rounded-lg p-4 crm-shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{deal.name}</p>
                    <p className="text-xs text-muted-foreground">{deal.stage}</p>
                  </div>
                  {deal.amount && <span className="font-semibold text-success text-sm">${deal.amount.toLocaleString()}</span>}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Call Wrap-up Dialog */}
      <Dialog open={callWrapOpen} onOpenChange={setCallWrapOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Call</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); logCallMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
            <div><Label>Subject</Label><Input name="subject" defaultValue={`Call with ${contact.first_name} ${contact.last_name}`} /></div>
            <div><Label>Result</Label><Input name="call_result" placeholder="e.g. Left voicemail, Discussed proposal" /></div>
            <div><Label>Notes</Label><Textarea name="description" rows={3} /></div>
            <p className="text-xs text-muted-foreground">
              Duration: ~{callStartTime ? Math.floor((Date.now() - callStartTime.getTime()) / 1000) : 0}s
            </p>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={logCallMutation.isPending}>Log Call</Button>
              <Button type="button" variant="outline" onClick={() => { setCallWrapOpen(false); setCallStartTime(null); }}>Skip</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
