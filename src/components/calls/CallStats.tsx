import { Phone, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";

interface CallStatsProps {
  calls: any[];
}

export function CallStats({ calls }: CallStatsProps) {
  const totalCalls = calls.length;
  const inbound = calls.filter((c) => c.call_type === "Inbound").length;
  const outbound = calls.filter((c) => c.call_type === "Outbound").length;
  const totalDuration = calls.reduce((sum, c) => sum + (c.call_duration || 0), 0);
  const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

  const stats = [
    { label: "Total Calls", value: totalCalls, icon: Phone, color: "text-primary bg-primary/10" },
    { label: "Inbound", value: inbound, icon: PhoneIncoming, color: "text-success bg-success/10" },
    { label: "Outbound", value: outbound, icon: PhoneOutgoing, color: "text-info bg-info/10" },
    { label: "Avg Duration", value: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`, icon: Clock, color: "text-warning bg-warning/10" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-card rounded-xl p-4 crm-shadow-card">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
