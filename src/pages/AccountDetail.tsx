import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Building2, Globe, Phone, Users, MapPin, DollarSign,
  Briefcase, Mail, Handshake, FileText,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: account } = useQuery({
    queryKey: ["account", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: parentAccount } = useQuery({
    queryKey: ["parent-account", account?.parent_account_id],
    queryFn: async () => {
      if (!account?.parent_account_id) return null;
      const { data } = await supabase.from("accounts").select("id, name").eq("id", account.parent_account_id).single();
      return data;
    },
    enabled: !!account?.parent_account_id,
  });

  const { data: childAccounts } = useQuery({
    queryKey: ["child-accounts", id],
    queryFn: async () => {
      const { data } = await supabase.from("accounts").select("id, name, industry").eq("parent_account_id", id!);
      return data ?? [];
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["account-contacts", id],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*").eq("account_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: deals } = useQuery({
    queryKey: ["account-deals", id],
    queryFn: async () => {
      const { data } = await supabase.from("deals").select("*").eq("account_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: notes } = useQuery({
    queryKey: ["account-notes", id],
    queryFn: async () => {
      const { data } = await supabase.from("notes").select("*").eq("account_id", id!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!account) return <AppLayout title="Account"><div className="text-center py-12 text-muted-foreground">Loading...</div></AppLayout>;

  const totalDealValue = deals?.reduce((s, d) => s + (d.amount || 0), 0) ?? 0;

  return (
    <AppLayout title={account.name}>
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/accounts")}>
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-xl p-6 crm-shadow-card">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">{account.name}</h2>
          {account.industry && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Briefcase className="w-3.5 h-3.5" />{account.industry}</p>}

          <div className="mt-4 space-y-2">
            {account.website && <a href={account.website.startsWith("http") ? account.website : `https://${account.website}`} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-primary hover:underline"><Globe className="w-4 h-4" />{account.website}</a>}
            {account.phone && <a href={`tel:${account.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline"><Phone className="w-4 h-4" />{account.phone}</a>}
            {account.billing_address && <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{account.billing_address}</p>}
            {account.employees && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" />{account.employees} employees</p>}
            {account.annual_revenue && <p className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="w-4 h-4" />${Number(account.annual_revenue).toLocaleString()} annual revenue</p>}
          </div>

          {parentAccount && (
            <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Parent Account</p>
              <button onClick={() => navigate(`/accounts/${parentAccount.id}`)} className="text-sm text-primary hover:underline font-medium">{parentAccount.name}</button>
            </div>
          )}

          {childAccounts && childAccounts.length > 0 && (
            <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Subsidiaries ({childAccounts.length})</p>
              {childAccounts.map((ca) => (
                <button key={ca.id} onClick={() => navigate(`/accounts/${ca.id}`)} className="block text-sm text-primary hover:underline">{ca.name}</button>
              ))}
            </div>
          )}

          {account.description && <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap">{account.description}</p>}
        </div>

        <div className="lg:col-span-2">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="crm-kpi-card text-center">
              <div className="text-xl font-display font-bold text-foreground">{contacts?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground">Contacts</div>
            </div>
            <div className="crm-kpi-card text-center">
              <div className="text-xl font-display font-bold text-foreground">{deals?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground">Deals</div>
            </div>
            <div className="crm-kpi-card text-center">
              <div className="text-xl font-display font-bold text-success">${totalDealValue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
          </div>

          <Tabs defaultValue="contacts">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="contacts">Contacts ({contacts?.length || 0})</TabsTrigger>
              <TabsTrigger value="deals">Deals ({deals?.length || 0})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="mt-4 space-y-3">
              {contacts?.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground text-sm crm-shadow-card">No contacts linked</div>
              ) : contacts?.map((c) => (
                <div key={c.id} className="bg-card rounded-lg p-4 crm-shadow-card flex items-center gap-3 cursor-pointer hover:bg-secondary/30" onClick={() => navigate(`/contacts/${c.id}`)}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{(c.first_name?.[0] || "")}{c.last_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.title}{c.email ? ` • ${c.email}` : ""}</p>
                  </div>
                  {c.phone && <a href={`tel:${c.phone}`} className="text-primary" onClick={(e) => e.stopPropagation()}><Phone className="w-4 h-4" /></a>}
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
                    <Badge variant="secondary" className="text-xs mt-1">{deal.stage}</Badge>
                  </div>
                  {deal.amount && <span className="font-semibold text-success text-sm">${deal.amount.toLocaleString()}</span>}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-3">
              {notes?.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center text-muted-foreground text-sm crm-shadow-card">No notes</div>
              ) : notes?.map((note) => (
                <div key={note.id} className="bg-card rounded-lg p-4 crm-shadow-card">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
