import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { EmployeeDashboard } from "@/components/dashboard/EmployeeDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { role, roleLoading } = useAuth();

  if (roleLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const titleMap: Record<string, string> = {
    super_admin: "Super Admin Dashboard",
    admin: "Admin Dashboard",
    manager: "Manager Dashboard",
    employee: "My Dashboard",
  };

  return (
    <AppLayout title={titleMap[role ?? "employee"] ?? "Dashboard"}>
      {role === "super_admin" && <SuperAdminDashboard />}
      {role === "admin" && <AdminDashboard />}
      {role === "manager" && <ManagerDashboard />}
      {(role === "employee" || !role) && <EmployeeDashboard />}
    </AppLayout>
  );
}
