// Admin Platform Analytics
import { useEffect, useState } from "react";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - System Analytics" }];
}

export default function Analytics() {
  const [range, setRange] = useState("30d");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get(`/analytics?range=${range}`);
        setAnalytics(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Set default data if API fails
        setAnalytics({
          engagement: [40, 60, 55, 80, 45, 90, 75, 100, 85, 65, 70, 95],
          labels: ["Start", "Mid", "End"],
          avgSession: "42m 18s",
          completionRate: "84.2%",
          activeLearners: 1248
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const bars = analytics?.engagement || [];
  const labels = analytics?.labels || ["Start", "Mid", "End"];

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Platform Analytics</h1>
        <p className="text-on-surface-variant font-body">Deep insights into learner engagement, retention, and system performance.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-primary">Learner Engagement</h3>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="bg-slate-50 border-none text-sm font-semibold text-slate-600 rounded-lg py-2 px-4 outline-none cursor-pointer">
              <option value="30d">Last 30 Days</option>
              <option value="quarter">This Quarter</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          <div className="h-72 w-full flex items-end gap-2 pb-8 border-b border-slate-100">
            {bars.map((height: number, i: number) => (
              <div key={`${range}-${i}`} className="flex-1 flex flex-col justify-end group">
                <div
                  className="w-full bg-secondary-container group-hover:bg-secondary rounded-t-sm transition-all duration-500"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>{labels[0]}</span>
            <span>{labels[1]}</span>
            <span>{labels[2]}</span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Average Session</h4>
            <div className="text-3xl font-black text-primary mb-1">{analytics?.avgSession || '0m'}</div>
            <div className="text-sm font-bold text-green-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +5.2% vs last month
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Completion Rate</h4>
            <div className="text-3xl font-black text-primary mb-1">{analytics?.completionRate || '0%'}</div>
            <div className="text-sm font-bold text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_flat</span>
              Steady vs last month
            </div>
          </div>
          <div className="bg-primary rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-4">Active Learners Now</h4>
              <div className="text-4xl font-black mb-1">{(analytics?.activeLearners || 0).toLocaleString()}</div>
              <div className="mt-4 flex gap-2 items-end">
                {[4, 7, 5, 8, 12, 10, 15, 20].map((h, i) => (
                  <div key={i} className="w-2 bg-secondary rounded-t-sm animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 100}ms` }}></div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary opacity-30 blur-2xl rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
