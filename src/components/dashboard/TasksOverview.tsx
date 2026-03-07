import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isToday } from "date-fns";

export function TasksOverview() {
  const { data: tasks } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "Completed")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5);
      return data ?? [];
    },
  });

  const statusIcons: Record<string, any> = {
    "Not Started": Circle, "In Progress": Clock, Completed: CheckCircle2, Deferred: AlertTriangle,
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 crm-shadow-card">
      <h3 className="font-display font-semibold text-foreground mb-1">Upcoming Tasks</h3>
      <p className="text-sm text-muted-foreground mb-4">Your pending tasks</p>

      {tasks?.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          All caught up! No pending tasks.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks?.map((task) => {
            const Icon = statusIcons[task.status] || Circle;
            const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
            return (
              <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                <Icon className={`w-4 h-4 flex-shrink-0 ${task.status === "In Progress" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  {task.due_date && (
                    <p className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                      {isOverdue ? "Overdue: " : "Due: "}{format(new Date(task.due_date), "MMM d")}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className={`text-xs ${
                  task.priority === "Urgent" ? "bg-destructive/10 text-destructive" :
                  task.priority === "High" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                }`}>{task.priority}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
