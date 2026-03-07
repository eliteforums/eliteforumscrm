import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, UserPlus, Handshake, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { data: recentCalls } = useQuery({
    queryKey: ["recent-calls"],
    queryFn: async () => {
      const { data } = await supabase
        .from("calls")
        .select("*, contacts(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["recent-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const activities = [
    ...(recentCalls?.map((c) => ({
      id: c.id,
      type: "call" as const,
      title: c.subject,
      subtitle: c.contacts ? `${c.contacts.first_name ?? ""} ${c.contacts.last_name}` : "Unknown",
      time: c.created_at,
      icon: Phone,
    })) ?? []),
    ...(recentLeads?.map((l) => ({
      id: l.id,
      type: "lead" as const,
      title: `${l.first_name ?? ""} ${l.last_name}`,
      subtitle: l.company,
      time: l.created_at,
      icon: UserPlus,
    })) ?? []),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return (
    <div className="bg-card rounded-xl p-6 crm-shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-1">Recent Activity</h3>
      <p className="text-sm text-muted-foreground mb-4">Latest updates across your CRM</p>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No recent activity. Start adding contacts and making calls!
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className={`p-2 rounded-lg ${a.type === "call" ? "bg-warning/10" : "bg-accent/10"}`}>
                <a.icon className={`w-4 h-4 ${a.type === "call" ? "text-warning" : "text-accent"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.subtitle}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(a.time), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
