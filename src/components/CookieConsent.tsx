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
    <div className="fixed bottom-4 right-4 z-[100] animate-fade-in max-w-xs">
      <div className="bg-card border border-border rounded-xl shadow-xl shadow-black/15 p-3">
        <div className="flex items-start gap-3">
          <Cookie className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-snug">
              We use cookies to improve your experience.{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline">Learn more</Link>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" onClick={handleAccept} className="text-[11px] font-semibold h-6 px-3">
                Accept
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDecline} className="text-[11px] h-6 px-2 text-muted-foreground">
                Decline
              </Button>
            </div>
          </div>
          <button onClick={handleDecline} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
