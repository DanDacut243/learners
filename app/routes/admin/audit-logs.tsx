import { useState, useEffect } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Audit Logs" }];
}

export default function AuditLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, create, update, delete

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const res = await apiClient.get('/audit-logs');
      setLogs(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.action === filter);

  const getActionBadge = (action: string) => {
    const badges: Record<string, { bg: string; text: string; icon: string }> = {
      create: { bg: 'bg-green-100', text: 'text-green-800', icon: 'add_circle' },
      update: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'edit' },
      delete: { bg: 'bg-red-100', text: 'text-red-800', icon: 'delete' },
    };
    return badges[action] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'help' };
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Audit Logs</h1>
        <p className="text-on-surface-variant font-body">Track all administrative actions for compliance and security.</p>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
        <div className="flex gap-3 flex-wrap">
          {['all', 'create', 'update', 'delete'].map((action) => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                filter === action
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Resource</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">IP Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-primary">{log.user?.name || 'System'}</div>
                        <div className="text-xs text-slate-500">{log.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                          <span className="material-symbols-outlined text-sm">{badge.icon}</span>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-primary">{log.model_type}</div>
                        <div className="text-xs text-slate-500">ID: {log.model_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        {log.changes ? (
                          <div className="text-xs">
                            {Object.entries(log.changes).slice(0, 2).map(([key, value]) => (
                              <div key={key} className="text-slate-600">
                                <span className="font-bold">{key}:</span> {String(value).substring(0, 20)}...
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-slate-500">{log.ip_address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600">
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Total Actions</h4>
          <div className="text-4xl font-black text-primary">{logs.length}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Creates</h4>
          <div className="text-4xl font-black text-green-600">{logs.filter(l => l.action === 'create').length}</div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Deletes</h4>
          <div className="text-4xl font-black text-red-600">{logs.filter(l => l.action === 'delete').length}</div>
        </div>
      </div>
    </div>
  );
}
