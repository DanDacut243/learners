import { useState, useEffect } from "react";
import apiClient from "~/services/api";

interface AiInsight {
  icon: string;
  title: string;
  text: string;
}

export function DashboardSidebar() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    try {
      const res = await apiClient.get('/ai/insights');
      setInsights(res.data.insights || []);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      // Fallback insights
      setInsights([
        { icon: 'info', title: 'Offline', text: 'AI insights unavailable. Check your connection.' }
      ]);
    } finally {
      setInsightsLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchInsights();
  }

  return (
    <aside className="col-span-12 lg:col-span-4 space-y-8">
      {/* Quick Action Buttons */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          <a title="Set up a new curriculum module" className="flex items-center gap-3 p-4 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all text-primary font-semibold text-sm" href="/admin/catalog">
            <span className="material-symbols-outlined text-secondary">add_circle</span>
            <div className="flex flex-col">
              <span>Create New Course</span>
              <span className="text-xs text-slate-500 font-normal mt-0.5">Start a fresh curriculum</span>
            </div>
          </a>
          <a title="Send access to a new teacher" className="flex items-center gap-3 p-4 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all text-primary font-semibold text-sm" href="/admin/users">
            <span className="material-symbols-outlined text-secondary">person_add</span>
            <div className="flex flex-col">
              <span>Invite Instructor</span>
              <span className="text-xs text-slate-500 font-normal mt-0.5">Send a platform invite</span>
            </div>
          </a>
          <a title="Download the latest usage data" className="flex items-center gap-3 p-4 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all text-primary font-semibold text-sm" href="/admin/analytics">
            <span className="material-symbols-outlined text-secondary">analytics</span>
            <div className="flex flex-col">
              <span>Export Monthly Audit</span>
              <span className="text-xs text-slate-500 font-normal mt-0.5">Download CSV reports</span>
            </div>
          </a>
        </div>
      </div>

      {/* AI Insights Widget — Real-time, Data-Driven */}
      <div className="relative bg-surface-container-highest/60 backdrop-blur-xl rounded-xl p-8 overflow-hidden border border-white/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-32 h-32 bg-tertiary-fixed opacity-30 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <span className="font-manrope font-extrabold text-primary text-sm tracking-tight">AI Insights</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-primary/50 hover:text-primary transition-colors cursor-pointer disabled:opacity-30"
              title="Refresh insights"
            >
              <span className={`material-symbols-outlined text-[18px] ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>

          {insightsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-5 h-5 bg-primary/10 rounded-full shrink-0 mt-0.5"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-primary/10 rounded w-1/3 mb-1.5"></div>
                    <div className="h-2.5 bg-primary/5 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0">{insight.icon || 'lightbulb'}</span>
                  <div>
                    <div className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-0.5">{insight.title}</div>
                    <p className="text-sm text-primary/80 leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-primary/50 italic">No insights available yet. Add more courses and students to generate data.</p>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-primary/10 rounded-full overflow-hidden">
              <div className={`h-full bg-tertiary-fixed-dim rounded-full transition-all duration-1000 ${insightsLoading ? 'w-1/3 animate-pulse' : 'w-full'}`}></div>
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
              {insightsLoading ? 'Analyzing...' : 'Live'}
            </span>
          </div>
        </div>
      </div>

      {/* System Load Miniature Card */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border-l-4 border-secondary">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Load</span>
          <span className="text-xs font-bold text-secondary">Normal</span>
        </div>
        <div className="mt-4 flex items-end gap-1 h-10">
          <div className="w-2 bg-secondary/20 h-4 rounded-t-sm"></div>
          <div className="w-2 bg-secondary/30 h-6 rounded-t-sm"></div>
          <div className="w-2 bg-secondary/20 h-3 rounded-t-sm"></div>
          <div className="w-2 bg-secondary/40 h-8 rounded-t-sm"></div>
          <div className="w-2 bg-secondary/30 h-5 rounded-t-sm"></div>
          <div className="w-2 bg-secondary h-10 rounded-t-sm"></div>
          <div className="w-2 bg-secondary/50 h-7 rounded-t-sm"></div>
        </div>
      </div>
    </aside>
  );
}
