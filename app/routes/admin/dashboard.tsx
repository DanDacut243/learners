import { DashboardMetrics } from "../../components/admin/DashboardMetrics";
import { RecentActivity } from "../../components/admin/RecentActivity";
import { DashboardSidebar } from "../../components/admin/DashboardSidebar";

export default function AdminDashboard() {
  return (
    <>
      <div className="mb-12">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Platform Overview</h1>
        <p className="text-on-surface-variant font-body">Intelligent monitoring and atelier health metrics.</p>
      </div>
      <DashboardMetrics />
      <div className="grid grid-cols-12 gap-8 items-start">
        <RecentActivity />
        <DashboardSidebar />
      </div>
    </>
  );
}
