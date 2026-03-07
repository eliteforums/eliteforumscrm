import { Users, UserPlus, DollarSign, Phone, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardsProps {
  contactsCount: number;
  leadsCount: number;
  dealsTotal: number;
  dealsCount: number;
  callsCount: number;
}

const formatCurrency = (val: number) =>
  val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`;

export function KpiCards({ contactsCount, leadsCount, dealsTotal, dealsCount, callsCount }: KpiCardsProps) {
  const kpis = [
    {
      title: "Total Contacts",
      value: contactsCount.toLocaleString(),
      icon: Users,
      change: "+12%",
      positive: true,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Leads",
      value: leadsCount.toLocaleString(),
      icon: UserPlus,
      change: "+8%",
      positive: true,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(dealsTotal),
      subtitle: `${dealsCount} deals`,
      icon: DollarSign,
      change: "+23%",
      positive: true,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Calls Made",
      value: callsCount.toLocaleString(),
      icon: Phone,
      change: "+5%",
      positive: true,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.title} className="crm-kpi-card">
          <div className="flex items-start justify-between mb-4">
            <div className={`${kpi.bg} p-2.5 rounded-lg`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${kpi.positive ? "text-success" : "text-destructive"}`}>
              {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {kpi.change}
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-foreground">{kpi.value}</div>
          <div className="text-sm text-muted-foreground mt-1">{kpi.title}</div>
          {kpi.subtitle && <div className="text-xs text-muted-foreground">{kpi.subtitle}</div>}
        </div>
      ))}
    </div>
  );
}
