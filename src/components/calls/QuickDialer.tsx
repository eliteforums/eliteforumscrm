import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Search, UserPlus, ContactRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuickDialerProps {
  onCallStart?: (contactId: string, phone: string, contactName: string) => void;
}

/** Check if the Contact Picker API is available */
function isContactPickerSupported(): boolean {
  return "contacts" in navigator && "ContactsManager" in window;
}

export function QuickDialer({ onCallStart }: QuickDialerProps) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contacts } = useQuery({
    queryKey: ["quick-dial-contacts", search],
    queryFn: async () => {
      let query = supabase
        .from("contacts")
        .select("id, first_name, last_name, phone, mobile, title, avatar_url")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (search)
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,mobile.ilike.%${search}%`
        );
      const { data } = await query;
      return (data ?? []).filter((c) => c.phone || c.mobile);
    },
  });

  // Import a phone contact via the Contact Picker API
  const importMutation = useMutation({
    mutationFn: async (picked: { name: string; phone: string }) => {
      const nameParts = picked.name.trim().split(/\s+/);
      const firstName = nameParts.slice(0, -1).join(" ") || null;
      const lastName = nameParts[nameParts.length - 1] || "Unknown";

      const { data, error } = await supabase
        .from("contacts")
        .insert({
          user_id: user!.id,
          first_name: firstName,
          last_name: lastName,
          mobile: picked.phone,
        })
        .select("id, first_name, last_name, mobile")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quick-dial-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success(`${data.first_name ?? ""} ${data.last_name} imported!`);
    },
    onError: () => toast.error("Failed to import contact"),
  });

  const handlePickContact = useCallback(async () => {
    if (!isContactPickerSupported()) {
      toast.error("Contact Picker is not supported on this device/browser. Try Chrome on Android.");
      return;
    }

    try {
      // @ts-ignore – Contact Picker API types aren't in standard TS lib
      const pickedContacts = await navigator.contacts.select(["name", "tel"], {
        multiple: false,
      });

      if (!pickedContacts || pickedContacts.length === 0) return;

      const picked = pickedContacts[0];
      const name = picked.name?.[0] || "Unknown";
      const phone = picked.tel?.[0];

      if (!phone) {
        toast.error("Selected contact has no phone number");
        return;
      }

      importMutation.mutate({ name, phone });
    } catch (err: any) {
      // User cancelled or permission denied
      if (err?.name !== "InvalidStateError" && err?.message !== "Request cancelled") {
        toast.error("Could not access phone contacts. Please grant permission and try again.");
      }
    }
  }, [importMutation]);

  const handleCall = useCallback(
    (contact: any) => {
      const phone = contact.mobile || contact.phone;
      const name = `${contact.first_name ?? ""} ${contact.last_name}`.trim();
      onCallStart?.(contact.id, phone, name);
      window.location.href = `tel:${phone}`;
    },
    [onCallStart]
  );

  return (
    <div className="space-y-3">
      {/* Import from phone contacts */}
      <Button
        variant="outline"
        className="w-full gap-2 text-sm"
        onClick={handlePickContact}
        disabled={importMutation.isPending}
      >
        <ContactRound className="w-4 h-4" />
        {importMutation.isPending ? "Importing..." : "Import from Phone Contacts"}
      </Button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts to call..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {contacts?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No contacts with phone numbers found
          </p>
        ) : (
          contacts?.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 active:bg-secondary transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0" onClick={() => navigate(`/contacts/${c.id}`)}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {(c.first_name?.[0] || "")}
                      {c.last_name[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.mobile || c.phone}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCall(c)}
                className="p-2.5 rounded-full bg-success/10 text-success hover:bg-success/20 active:bg-success/30 transition-colors flex-shrink-0"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {!isContactPickerSupported() && (
        <p className="text-xs text-muted-foreground text-center">
          Tip: Use Chrome on Android for phone contact import
        </p>
      )}
    </div>
  );
}
