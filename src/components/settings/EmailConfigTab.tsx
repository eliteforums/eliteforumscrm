import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Save, Loader2, CheckCircle2, AlertCircle, Send, Eye, EyeOff, Server, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Provider = "smtp" | "resend";

export function EmailConfigTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [provider, setProvider] = useState<Provider>("smtp");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpEncryption, setSmtpEncryption] = useState("tls");
  const [resendApiKey, setResendApiKey] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["email-config"],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_config")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (config) {
      setProvider((config.provider as Provider) || "smtp");
      setSmtpHost(config.smtp_host || "");
      setSmtpPort(String(config.smtp_port || 587));
      setSmtpUsername(config.smtp_username || "");
      setSmtpPassword(config.smtp_password || "");
      setSmtpEncryption(config.smtp_encryption || "tls");
      setResendApiKey(config.resend_api_key || "");
      setFromName(config.from_name || "");
      setFromEmail(config.from_email || "");
      setIsActive(config.is_active || false);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        provider,
        smtp_host: provider === "smtp" ? smtpHost : null,
        smtp_port: provider === "smtp" ? parseInt(smtpPort) : null,
        smtp_username: provider === "smtp" ? smtpUsername : null,
        smtp_password: provider === "smtp" ? smtpPassword : null,
        smtp_encryption: provider === "smtp" ? smtpEncryption : null,
        resend_api_key: provider === "resend" ? resendApiKey : null,
        from_name: fromName,
        from_email: fromEmail,
        is_active: isActive,
      };

      if (config) {
        const { error } = await supabase.from("email_config").update(payload).eq("id", config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_config").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-config"] });
      toast.success("Email configuration saved");
    },
    onError: () => toast.error("Failed to save configuration"),
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: testEmail,
          subject: "Elite CRM - Test Email",
          html: "<h2>Test Email</h2><p>Your email configuration is working correctly! 🎉</p><p>Sent from Elite CRM.</p>",
          isTest: true,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => toast.success("Test email sent successfully!"),
    onError: (err: Error) => toast.error(`Test failed: ${err.message}`),
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div className="bg-card rounded-xl p-6 crm-shadow-card">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" /> Email Provider
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setProvider("smtp")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              provider === "smtp"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-info" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">SMTP Server</h4>
                <p className="text-xs text-muted-foreground">Gmail, Outlook, custom</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Connect your own SMTP server for full control over email delivery.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProvider("resend")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              provider === "resend"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Resend</h4>
                <p className="text-xs text-muted-foreground">Modern email API</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Use Resend's developer-friendly API for reliable email delivery.
            </p>
          </button>
        </div>

        {/* Common fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>From Name</Label>
              <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Elite CRM" />
            </div>
            <div>
              <Label>From Email *</Label>
              <Input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="noreply@yourdomain.com" />
            </div>
          </div>
        </div>
      </div>

      {/* SMTP Configuration */}
      {provider === "smtp" && (
        <div className="bg-card rounded-xl p-6 crm-shadow-card">
          <h3 className="text-base font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-info" /> SMTP Configuration
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>SMTP Host *</Label>
                <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
              </div>
              <div>
                <Label>SMTP Port *</Label>
                <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" type="number" />
              </div>
            </div>
            <div>
              <Label>Username *</Label>
              <Input value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} placeholder="your-email@gmail.com" />
            </div>
            <div>
              <Label>Password / App Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">For Gmail, use an App Password from your Google Account settings</p>
            </div>
            <div>
              <Label>Encryption</Label>
              <select
                value={smtpEncryption}
                onChange={(e) => setSmtpEncryption(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="tls">TLS (Recommended)</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Common SMTP Presets</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Gmail", host: "smtp.gmail.com", port: "587" },
                  { label: "Outlook", host: "smtp.office365.com", port: "587" },
                  { label: "Yahoo", host: "smtp.mail.yahoo.com", port: "587" },
                  { label: "Zoho", host: "smtp.zoho.com", port: "587" },
                ].map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => { setSmtpHost(preset.host); setSmtpPort(preset.port); setSmtpEncryption("tls"); }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resend Configuration */}
      {provider === "resend" && (
        <div className="bg-card rounded-xl p-6 crm-shadow-card">
          <h3 className="text-base font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" /> Resend Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <Label>API Key *</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_••••••••••••"
                  className="pr-10 font-mono"
                />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/api-keys</a>
              </p>
            </div>
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Make sure you've verified your domain on Resend and set the <code className="text-primary">from_email</code> to an address on that domain.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status & Actions */}
      <div className="bg-card rounded-xl p-6 crm-shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-display font-semibold text-foreground">Status</h3>
            <Badge variant="secondary" className={isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
              {isActive ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</> : <><AlertCircle className="w-3 h-3 mr-1" /> Inactive</>}
            </Badge>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-background after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2 flex-1">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </Button>
        </div>

        {/* Test Email */}
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Send Test Email</h4>
          <div className="flex gap-2">
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending || !testEmail || !isActive}
              className="gap-1.5"
            >
              {testMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Test
            </Button>
          </div>
          {!isActive && <p className="text-xs text-muted-foreground mt-1">Enable the configuration above to send a test email</p>}
        </div>
      </div>
    </div>
  );
}
