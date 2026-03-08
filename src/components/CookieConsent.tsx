import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getOrCreateVisitorId(): string {
  const key = "elite_crm_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

async function trackVisit() {
  const visitorId = getOrCreateVisitorId();
  const lastTracked = getCookie("elite_crm_last_track");
  const now = Date.now();

  // Only track once per 30 minutes
  if (lastTracked && now - parseInt(lastTracked) < 30 * 60 * 1000) return;

  setCookie("elite_crm_last_track", now.toString(), 1);

  try {
    await supabase.from("visitor_analytics").insert({
      visitor_id: visitorId,
      page_url: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      language: navigator.language,
      platform: navigator.platform || null,
    });
  } catch (e) {
    // Silent fail — analytics should never break the app
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookie("elite_crm_cookie_consent");
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    } else if (consent === "accepted") {
      trackVisit();
    }
  }, []);

  const handleAccept = () => {
    setCookie("elite_crm_cookie_consent", "accepted", 365);
    setVisible(false);
    trackVisit();
  };

  const handleDecline = () => {
    setCookie("elite_crm_cookie_consent", "declined", 365);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-sm mb-1">We use cookies</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to improve your experience, analyze traffic, and personalize content. By clicking "Accept", you consent to our use of cookies. Read our{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for more info.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={handleAccept} className="text-xs font-semibold h-8 px-4">
                Accept All
              </Button>
              <Button size="sm" variant="outline" onClick={handleDecline} className="text-xs font-semibold h-8 px-4">
                Decline
              </Button>
            </div>
          </div>
          <button onClick={handleDecline} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
