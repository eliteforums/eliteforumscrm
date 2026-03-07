import { Users, UserPlus, DollarSign, Phone, TrendingUp, TrendingDown, ClipboardList } from "lucide-react";

interface KpiCardsProps {
  contactsCount: number;
  leadsCount: number;
  dealsTotal: number;
  dealsCount: number;
  callsCount: number;
  tasksCount?: number;
}

const formatCurrency = (val: number) =>
  val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`;

export function KpiCards({ contactsCount, leadsCount, dealsTotal, dealsCount, callsCount, tasksCount = 0 }: KpiCardsProps) {
  const kpis = [
    { title: "Total Contacts", value: contactsCount.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { title: "Active Leads", value: leadsCount.toLocaleString(), icon: UserPlus, color: "text-accent", bg: "bg-accent/10" },
    { title: "Pipeline Value", value: formatCurrency(dealsTotal), subtitle: `${dealsCount} deals`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { title: "Calls Made", value: callsCount.toLocaleString(), icon: Phone, color: "text-warning", bg: "bg-warning/10" },
    { title: "Open Tasks", value: tasksCount.toLocaleString(), icon: ClipboardList, color: "text-info", bg: "bg-info/10" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.title} className="crm-kpi-card">
          <div className="flex items-start justify-between mb-3">
            <div className={`${kpi.bg} p-2 rounded-lg`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-display font-bold text-foreground">{kpi.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{kpi.title}</div>
          {kpi.subtitle && <div className="text-xs text-muted-foreground">{kpi.subtitle}</div>}
        </div>
      ))}
    </div>
  );
}
