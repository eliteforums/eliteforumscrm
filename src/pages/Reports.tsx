import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, DollarSign, Target, Clock, Users, ArrowUpRight,
  ArrowDownRight, Percent, BarChart3, PieChart as PieChartIcon,
} from "lucide-react";
import { format, subDays, differenceInDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

const STAGES = ["Qualification", "Needs Analysis", "Value Proposition", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const COLORS = [
  "hsl(231, 44%, 47%)", "hsl(157, 47%, 52%)", "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)", "hsl(217, 91%, 60%)", "hsl(340, 65%, 50%)",
];

export default function ReportsPage() {
  const { data: deals } = useQuery({
    queryKey: ["reports-deals"],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("*");
      return data ?? [];
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["reports-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("leads").select("*");
      return data ?? [];
    },
  });

  const { data: calls } = useQuery({
    queryKey: ["reports-calls"],
    queryFn: async () => {
      const { data } = await supabase.from("calls").select("*");
      return data ?? [];
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["reports-contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*");
      return data ?? [];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ["reports-tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*");
      return data ?? [];
    },
  });

  // KPI Calculations
  const wonDeals = deals?.filter((d) => d.stage === "Closed Won") ?? [];
  const lostDeals = deals?.filter((d) => d.stage === "Closed Lost") ?? [];
  const openDeals = deals?.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage)) ?? [];
  const totalRevenue = wonDeals.reduce((s, d) => s + (d.amount || 0), 0);
  const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
  const winRate = wonDeals.length + lostDeals.length > 0
    ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0;

  // Sales cycle (avg days from created to close for won deals)
  const salesCycleDays = wonDeals.length > 0
    ? wonDeals.reduce((s, d) => s + differenceInDays(new Date(d.updated_at), new Date(d.created_at)), 0) / wonDeals.length
    : 0;

  // Pipeline Velocity = (Open Deals × Win Rate % × Avg Deal Size) / Sales Cycle
  const pipelineVelocity = salesCycleDays > 0
    ? (openDeals.length * (winRate / 100) * avgDealSize) / salesCycleDays : 0;

  // Pipeline value
  const pipelineValue = openDeals.reduce((s, d) => s + (d.amount || 0), 0);

  // Lead conversion rate
  const convertedLeads = leads?.filter((l) => l.converted) ?? [];
  const totalLeads = leads?.length ?? 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads.length / totalLeads) * 100 : 0;

  // Funnel data
  const funnelData = STAGES.filter((s) => s !== "Closed Lost").map((stage) => ({
    name: stage,
    value: deals?.filter((d) => d.stage === stage).length ?? 0,
  }));

  // Monthly revenue trend (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const monthDeals = wonDeals.filter((d) => {
      const date = new Date(d.updated_at);
      return date >= start && date <= end;
    });
    return {
      month: format(start, "MMM"),
      revenue: monthDeals.reduce((s, d) => s + (d.amount || 0), 0),
      deals: monthDeals.length,
    };
  });

  // Lead source distribution
  const sourceMap: Record<string, number> = {};
  leads?.forEach((l) => {
    const src = l.lead_source || "Unknown";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

  // Call activity last 7 days
  const callActivity = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, "yyyy-MM-dd");
    const dayCalls = calls?.filter((c) => c.call_start_time.startsWith(dayStr)) ?? [];
    return {
      day: format(day, "EEE"),
      calls: dayCalls.length,
      duration: Math.round(dayCalls.reduce((s, c) => s + (c.call_duration || 0), 0) / 60),
    };
  });

  // Deal stage distribution
  const stageData = STAGES.map((stage) => ({
    name: stage.replace("Closed ", ""),
    count: deals?.filter((d) => d.stage === stage).length ?? 0,
    value: deals?.filter((d) => d.stage === stage).reduce((s, d) => s + (d.amount || 0), 0) ?? 0,
  }));

  // Task completion metrics
  const completedTasks = tasks?.filter((t) => t.status === "Completed").length ?? 0;
  const overdueTasks = tasks?.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "Completed").length ?? 0;
  const totalTasks = tasks?.length ?? 0;

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Top KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: "bg-success/10 text-success", trend: "+12%", up: true },
            { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}k`, icon: TrendingUp, color: "bg-primary/10 text-primary" },
            { label: "Win Rate", value: `${winRate.toFixed(1)}%`, icon: Target, color: "bg-accent/10 text-accent" },
            { label: "Avg Deal Size", value: `$${avgDealSize.toFixed(0)}`, icon: BarChart3, color: "bg-warning/10 text-warning" },
            { label: "Sales Cycle", value: `${salesCycleDays.toFixed(0)}d`, icon: Clock, color: "bg-info/10 text-info" },
            { label: "Pipeline Velocity", value: `$${pipelineVelocity.toFixed(0)}/d`, icon: TrendingUp, color: "bg-destructive/10 text-destructive" },
          ].map((kpi) => (
            <div key={kpi.label} className="crm-kpi-card">
              <div className={`${kpi.color} p-2 rounded-lg w-fit mb-2`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <div className="text-xl font-display font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {kpi.label}
                {kpi.trend && (
                  <span className={`flex items-center text-xs ${kpi.up ? "text-success" : "text-destructive"}`}>
                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="crm-kpi-card">
            <div className="text-sm text-muted-foreground">Lead Conversion</div>
            <div className="text-2xl font-display font-bold text-foreground">{conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">{convertedLeads.length} of {totalLeads} leads</div>
          </div>
          <div className="crm-kpi-card">
            <div className="text-sm text-muted-foreground">Total Contacts</div>
            <div className="text-2xl font-display font-bold text-foreground">{contacts?.length ?? 0}</div>
          </div>
          <div className="crm-kpi-card">
            <div className="text-sm text-muted-foreground">Task Completion</div>
            <div className="text-2xl font-display font-bold text-foreground">{totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%</div>
            <div className="text-xs text-muted-foreground">{overdueTasks} overdue</div>
          </div>
          <div className="crm-kpi-card">
            <div className="text-sm text-muted-foreground">Total Calls</div>
            <div className="text-2xl font-display font-bold text-foreground">{calls?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">{Math.round((calls?.reduce((s, c) => s + (c.call_duration || 0), 0) ?? 0) / 60)}m total</div>
          </div>
        </div>

        <Tabs defaultValue="revenue">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="calls">Call Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Monthly Revenue Trend</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Deal Stage Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Deals" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Sales Funnel</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {funnelData.map((stage, i) => {
                      const maxVal = Math.max(...funnelData.map((f) => f.value), 1);
                      const width = Math.max((stage.value / maxVal) * 100, 8);
                      return (
                        <div key={stage.name} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-28 truncate">{stage.name}</span>
                          <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                            <div
                              className="h-full rounded-md flex items-center justify-end px-2 transition-all"
                              style={{ width: `${width}%`, backgroundColor: COLORS[i] }}
                            >
                              <span className="text-xs font-medium text-white">{stage.value}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Pipeline by Value</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stageData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]} />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Value" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Lead Sources</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Lead Status Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["New", "Contacted", "Qualified", "Unqualified", "Converted"].map((status, i) => {
                      const count = leads?.filter((l) => l.lead_status === status).length ?? 0;
                      const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">{status}</span>
                            <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calls" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Call Volume (Last 7 Days)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={callActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="calls" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} name="Calls" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Call Duration (min/day)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={callActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Line type="monotone" dataKey="duration" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} name="Minutes" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
