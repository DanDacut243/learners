import { useState, useEffect } from "react";
import apiClient from "~/services/api";

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await apiClient.get('/audit-logs');
        const logs = Array.isArray(res.data) ? res.data : res.data.data || [];
        // Map audit logs to activity feed format
        const mapped = logs.slice(0, 6).map((log: any) => ({
          type: `${log.action?.charAt(0).toUpperCase()}${log.action?.slice(1)} ${log.model_type || 'Record'}`,
          message: formatLogMessage(log),
          time: formatTimeAgo(log.created_at),
        }));
        setActivities(mapped);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  function formatLogMessage(log: any): string {
    const model = log.model_type || 'record';
    const action = log.action || 'modified';
    const user = log.user?.name || 'System';
    return `${user} ${action}d a ${model.toLowerCase()} (ID: ${log.model_id})`;
  }

  function formatTimeAgo(dateStr: string): string {
    if (!dateStr) return 'Just now';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  if (loading) {
    return (
      <section className="col-span-12 lg:col-span-8 bg-surface-container-low p-1 rounded-xl">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <div className="h-8 bg-slate-200 rounded mb-8 w-48 animate-pulse"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="mt-1 w-2 h-2 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-12 lg:col-span-8 bg-surface-container-low p-1 rounded-xl">
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-primary tracking-tight">Recent Activity</h2>
          <a title="View full system activity logs" href="/admin/audit-logs" className="text-sm font-bold text-secondary uppercase tracking-widest hover:underline">View All Logs</a>
        </div>
        <div className="space-y-8">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className={`flex items-start gap-4 pb-8 ${index !== activities.length - 1 ? 'border-b border-slate-50' : 'last:border-0 last:pb-0'}`}>
                <div className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary">{activity.type || 'Activity'}</span>
                    <span className="text-xs text-slate-400 font-medium">{activity.time || 'Just now'}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{activity.message || 'No description'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
