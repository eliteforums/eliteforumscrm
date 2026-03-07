import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CALL_PURPOSES = ["Prospecting", "Follow-up", "Support", "Demo", "Negotiation", "Administrative"];

interface LogCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: any;
  contacts: any[];
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
}

export function LogCallDialog({ open, onOpenChange, editing, contacts, onSubmit, isPending }: LogCallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit Call" : "Log New Call"}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
          <div><Label>Subject *</Label><Input name="subject" required defaultValue={editing?.subject} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <select name="call_type" defaultValue={editing?.call_type || "Outbound"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="Outbound">Outbound</option>
                <option value="Inbound">Inbound</option>
              </select>
            </div>
            <div>
              <Label>Purpose</Label>
              <select name="call_purpose" defaultValue={editing?.call_purpose || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select...</option>
                {CALL_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact</Label>
              <select name="contact_id" defaultValue={editing?.contact_id || ""} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">None</option>
                {contacts?.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <div>
              <Label>Duration (seconds)</Label>
              <Input name="call_duration" type="number" min="0" defaultValue={editing?.call_duration ?? 0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Result</Label>
              <Input name="call_result" defaultValue={editing?.call_result} />
            </div>
            <div>
              <Label>Status</Label>
              <select name="status" defaultValue={editing?.status || "Completed"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div><Label>Notes</Label><Textarea name="description" rows={3} defaultValue={editing?.description} /></div>
          <Button type="submit" className="w-full" disabled={isPending}>{editing ? "Update" : "Log"} Call</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
