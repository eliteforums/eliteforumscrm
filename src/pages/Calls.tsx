import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { CallStats } from "@/components/calls/CallStats";
import { CallTimeline } from "@/components/calls/CallTimeline";
import { QuickDialer } from "@/components/calls/QuickDialer";
import { LogCallDialog } from "@/components/calls/LogCallDialog";
import { CallWrapUpDialog } from "@/components/calls/CallWrapUpDialog";

export default function CallsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("timeline");

  // Click-to-call state
  const [callWrapOpen, setCallWrapOpen] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callingContactId, setCallingContactId] = useState<string | null>(null);
  const [callingContactName, setCallingContactName] = useState("");

  const { data: calls, isLoading, error, refetch } = useQuery({
    queryKey: ["calls-list", search],
    queryFn: async () => {
      let joinedQuery = supabase
        .from("calls")
        .select("*, contacts(id, first_name, last_name)")
        .order("call_start_time", { ascending: false });

      if (search) joinedQuery = joinedQuery.ilike("subject", `%${search}%`);

      const { data: joinedData, error: joinedError } = await joinedQuery;
      if (!joinedError) return joinedData ?? [];

      // Fallback path (mobile-safe): fetch calls + contacts separately and merge.
      let callsQuery = supabase
        .from("calls")
        .select("*")
        .order("call_start_time", { ascending: false });

      if (search) callsQuery = callsQuery.ilike("subject", `%${search}%`);

      const { data: callsOnly, error: callsError } = await callsQuery;
      if (callsError) throw callsError;

      const contactIds = Array.from(
        new Set((callsOnly ?? []).map((c) => c.contact_id).filter(Boolean))
      ) as string[];

      if (contactIds.length === 0) return callsOnly ?? [];

      const { data: contactsData } = await supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .in("id", contactIds);

      const contactMap = new Map((contactsData ?? []).map((c) => [c.id, c]));

      return (callsOnly ?? []).map((call) => ({
        ...call,
        contacts: call.contact_id ? contactMap.get(call.contact_id) ?? null : null,
      }));
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["contacts-for-calls"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("id, first_name, last_name");
      return data ?? [];
    },
  });

  // Handle return from phone dialer
  const handleCallStart = useCallback((contactId: string, phone: string, contactName: string) => {
    setCallingContactId(contactId);
    setCallingContactName(contactName);
    setCallStartTime(new Date());
  }, []);

  useEffect(() => {
    if (!callStartTime) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && callStartTime) {
        setCallWrapOpen(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [callStartTime]);

  const wrapUpMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const duration = callStartTime ? Math.floor((Date.now() - callStartTime.getTime()) / 1000) : 0;
      const { error } = await supabase.from("calls").insert({
        user_id: user!.id,
        contact_id: callingContactId,
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
      queryClient.invalidateQueries({ queryKey: ["calls-list"] });
      setCallWrapOpen(false);
      setCallStartTime(null);
      setCallingContactId(null);
      toast.success("Call logged!");
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
      setIsOpen(false);
      setEditing(null);
      toast.success(editing ? "Call updated" : "Call logged");
    },
    onError: () => toast.error("Failed to save call"),
  });

  return (
    <AppLayout
      title="Call Hub"
      actions={
        <Button size="sm" className="gap-2" onClick={() => { setEditing(null); setIsOpen(true); }}>
          <Plus className="w-4 h-4" /> Log Call
        </Button>
      }
    >
      <div className="space-y-4">
        <CallStats calls={calls ?? []} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-grid">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="dialer" className="gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Quick Dial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4 space-y-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search calls..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="bg-card rounded-xl p-6 text-center crm-shadow-card space-y-3">
                <p className="text-sm text-muted-foreground">Couldn’t load calls right now.</p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
              </div>
            ) : (
              <CallTimeline
                calls={calls ?? []}
                onEdit={(call) => { setEditing(call); setIsOpen(true); }}
              />
            )}
          </TabsContent>

          <TabsContent value="dialer" className="mt-4">
            <div className="bg-card rounded-xl p-4 crm-shadow-card">
              <QuickDialer onCallStart={handleCallStart} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <LogCallDialog
        open={isOpen}
        onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}
        editing={editing}
        contacts={contacts ?? []}
        onSubmit={(fd) => saveMutation.mutate(fd)}
        isPending={saveMutation.isPending}
      />

      <CallWrapUpDialog
        open={callWrapOpen}
        onOpenChange={setCallWrapOpen}
        contactName={callingContactName}
        callStartTime={callStartTime}
        onSubmit={(fd) => wrapUpMutation.mutate(fd)}
        isPending={wrapUpMutation.isPending}
        onSkip={() => { setCallWrapOpen(false); setCallStartTime(null); setCallingContactId(null); }}
      />

      {/* Mobile FAB for quick call */}
      <button
        onClick={() => setActiveTab("dialer")}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Quick Dial"
      >
        <Phone className="w-6 h-6" />
      </button>
    </AppLayout>
  );
}
