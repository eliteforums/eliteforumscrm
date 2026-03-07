import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, Clock, AlertTriangle, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const PRIORITIES = ["Low", "Normal", "High", "Urgent"];
const STATUSES = ["Not Started", "In Progress", "Completed", "Deferred"];
const priorityColors: Record<string, string> = {
  Low: "bg-muted text-muted-foreground", Normal: "bg-info/10 text-info",
  High: "bg-warning/10 text-warning", Urgent: "bg-destructive/10 text-destructive",
};
const statusIcons: Record<string, any> = {
  "Not Started": Circle, "In Progress": Clock, Completed: CheckCircle2, Deferred: AlertTriangle,
};

export default function TasksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", filter],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*, contacts(first_name, last_name)").order("due_date", { ascending: true, nullsFirst: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const task = {
        user_id: user!.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        due_date: (formData.get("due_date") as string) || null,
        priority: formData.get("priority") as string || "Normal",
        status: formData.get("status") as string || "Not Started",
      };
      if (editing) {
        const { error } = await supabase.from("tasks").update(task).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert(task);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsOpen(false); setEditing(null);
      toast.success(editing ? "Task updated" : "Task created");
    },
    onError: () => toast.error("Failed to save task"),
  });

  const toggleComplete = useMutation({
    mutationFn: async (task: any) => {
      const newStatus = task.status === "Completed" ? "Not Started" : "Completed";
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
  });

  return (
    <AppLayout title="Tasks" actions={
      <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) setEditing(null); }}>
        <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Task</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
            <div><Label>Title *</Label><Input name="title" required defaultValue={editing?.title} /></div>
            <div><Label>Description</Label><Textarea name="description" rows={3} defaultValue={editing?.description} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Due Date</Label><Input name="due_date" type="date" defaultValue={editing?.due_date} /></div>
              <div><Label>Priority</Label>
                <select name="priority" defaultValue={editing?.priority || "Normal"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Status</Label>
              <select name="status" defaultValue={editing?.status || "Not Started"} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full" disabled={saveMutation.isPending}>{editing ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    }>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {["all", ...STATUSES].map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
        {isLoading ? <div className="text-center py-12 text-muted-foreground">Loading...</div> : (
          <div className="space-y-2">
            {tasks?.length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center text-muted-foreground crm-shadow-card">No tasks yet.</div>
            ) : tasks?.map((task) => {
              const Icon = statusIcons[task.status] || Circle;
              return (
                <div key={task.id} className="bg-card rounded-lg p-4 crm-shadow-card flex items-start gap-3 hover:crm-shadow-card-hover transition-shadow">
                  <button onClick={() => toggleComplete.mutate(task)} className="mt-0.5">
                    <Icon className={`w-5 h-5 ${task.status === "Completed" ? "text-success" : "text-muted-foreground"}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${task.status === "Completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
                      <Badge className={priorityColors[task.priority]} variant="secondary">{task.priority}</Badge>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">Due: {format(new Date(task.due_date), "MMM d, yyyy")}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(task); setIsOpen(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(task.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
