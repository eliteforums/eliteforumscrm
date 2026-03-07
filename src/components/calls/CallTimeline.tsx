import { PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isYesterday, startOfDay } from "date-fns";

interface CallTimelineProps {
  calls: any[];
  onEdit?: (call: any) => void;
}

export function CallTimeline({ calls, onEdit }: CallTimelineProps) {
  // Group calls by date
  const grouped = (calls || []).reduce<Record<string, any[]>>((acc, call) => {
    const day = startOfDay(new Date(call.call_start_time)).toISOString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(call);
    return acc;
  }, {});

  const formatDayLabel = (iso: string) => {
    const d = new Date(iso);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "EEEE, MMM d");
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (!calls?.length) {
    return (
      <div className="bg-card rounded-xl p-8 text-center text-muted-foreground crm-shadow-card">
        No calls recorded yet. Tap a contact to make your first call!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([day, dayCalls]) => (
          <div key={day}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {formatDayLabel(day)}
            </h3>
            <div className="space-y-2">
              {dayCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-card rounded-xl p-4 crm-shadow-card active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => onEdit?.(call)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${call.call_type === "Inbound" ? "bg-success/10" : "bg-info/10"}`}>
                      {call.call_type === "Inbound" ? (
                        <PhoneIncoming className="w-5 h-5 text-success" />
                      ) : (
                        <PhoneOutgoing className="w-5 h-5 text-info" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground truncate">{call.subject}</p>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {format(new Date(call.call_start_time), "h:mm a")}
                        </span>
                      </div>
                      {call.contacts && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {call.contacts.first_name ?? ""} {call.contacts.last_name}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {call.call_duration ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {formatDuration(call.call_duration)}
                          </span>
                        ) : null}
                        {call.call_purpose && (
                          <Badge variant="secondary" className="text-xs py-0">{call.call_purpose}</Badge>
                        )}
                        <Badge variant="secondary" className={`text-xs py-0 ${call.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {call.status}
                        </Badge>
                      </div>
                      {call.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{call.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
