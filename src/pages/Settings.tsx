import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Shield, Smartphone, Bell, Save, Loader2, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EmailConfigTab } from "@/components/settings/EmailConfigTab";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", manager: "Manager", employee: "Employee",
};
const roleColors: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive", admin: "bg-primary/10 text-primary",
  manager: "bg-accent/10 text-accent", employee: "bg-warning/10 text-warning",
};

export default function SettingsPage() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) setFullName(profile.full_name || "");
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  return (
    <AppLayout title="Settings">
      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="profile">
          <TabsList className="w-full justify-start mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="gap-1.5"><User className="w-4 h-4" /> Profile</TabsTrigger>
            <TabsTrigger value="email" className="gap-1.5"><Mail className="w-4 h-4" /> Email</TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5"><Shield className="w-4 h-4" /> Security</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
            <TabsTrigger value="pwa" className="gap-1.5"><Smartphone className="w-4 h-4" /> PWA</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-card rounded-xl p-6 crm-shadow-card space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">{fullName || "User"}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </p>
                  {role && (
                    <Badge className={`mt-1 ${roleColors[role] || ""}`} variant="secondary">
                      {role === "super_admin" && <Crown className="w-3 h-3 mr-1" />}
                      {roleLabels[role] || role}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="gap-2">
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email">
            <EmailConfigTab />
          </TabsContent>

          <TabsContent value="security">
            <div className="bg-card rounded-xl p-6 crm-shadow-card space-y-6">
              <h3 className="text-lg font-display font-semibold text-foreground">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-1">Role & Permissions</h4>
                  <p className="text-sm text-muted-foreground">
                    Your current role is <strong>{roleLabels[role || "employee"]}</strong>.
                    {role === "employee" && " You can only view and manage your own data."}
                    {role === "manager" && " You can view all team data and manage your own records."}
                    {role === "admin" && " You have view access to all data and can manage users."}
                    {role === "super_admin" && " You have full system access including role management."}
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-1">Session</h4>
                  <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last sign in: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "N/A"}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-card rounded-xl p-6 crm-shadow-card">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "New lead assigned", desc: "Get notified when a new lead is assigned to you" },
                  { label: "Deal stage change", desc: "Notifications when deals move to a new stage" },
                  { label: "Task reminders", desc: "Reminders for upcoming and overdue tasks" },
                  { label: "Call follow-ups", desc: "Reminders to follow up after calls" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pwa">
            <div className="bg-card rounded-xl p-6 crm-shadow-card space-y-6">
              <h3 className="text-lg font-display font-semibold text-foreground">PWA Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">Install Elite CRM</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Install this app on your device for the best experience. Access it from your home screen with offline support.
                  </p>
                  <Button size="sm" variant="outline" className="gap-1.5"
                    onClick={() => toast.info("Use your browser's 'Add to Home Screen' or install prompt to install the PWA")}>
                    <Smartphone className="w-3.5 h-3.5" /> Install App
                  </Button>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-1">Offline Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Elite CRM works offline. Changes made while offline will sync automatically when you reconnect.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
