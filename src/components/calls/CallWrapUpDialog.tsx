import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock } from "lucide-react";

interface CallWrapUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  callStartTime: Date | null;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  onSkip: () => void;
}

export function CallWrapUpDialog({ open, onOpenChange, contactName, callStartTime, onSubmit, isPending, onSkip }: CallWrapUpDialogProps) {
  const durationSec = callStartTime ? Math.floor((Date.now() - callStartTime.getTime()) / 1000) : 0;
  const durationMin = Math.floor(durationSec / 60);
  const durationRemSec = durationSec % 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Log Call
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{durationMin}:{String(durationRemSec).padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground">Call Duration</p>
          </div>
          <div><Label>Subject</Label><Input name="subject" defaultValue={`Call with ${contactName}`} /></div>
          <div>
            <Label>Result</Label>
            <select name="call_result" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select result...</option>
              <option value="Connected">Connected</option>
              <option value="Left Voicemail">Left Voicemail</option>
              <option value="No Answer">No Answer</option>
              <option value="Busy">Busy</option>
              <option value="Wrong Number">Wrong Number</option>
              <option value="Follow-up Scheduled">Follow-up Scheduled</option>
            </select>
          </div>
          <div><Label>Notes</Label><Textarea name="description" rows={3} placeholder="What was discussed?" /></div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isPending}>Log Call</Button>
            <Button type="button" variant="outline" onClick={onSkip}>Skip</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
