import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useState } from "react";

export function Topbar() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const displayName = user?.name ?? "Guest";
  const displayRole = user?.subtitle ?? "Unknown";
  const [notifOpen, setNotifOpen] = useState(false);

  function formatTime(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  }

  function getIcon(type: string) {
    switch(type) {
      case 'success': return <span className="material-symbols-outlined text-green-500">check_circle</span>;
      case 'warning': return <span className="material-symbols-outlined text-amber-500">warning</span>;
      case 'error': return <span className="material-symbols-outlined text-red-500">error</span>;
      default: return <span className="material-symbols-outlined text-blue-500">info</span>;
    }
  }

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-slate-50 flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-secondary/20 outline-none" placeholder="Search..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="material-symbols-outlined text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer relative"
            >
              notifications
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-primary text-sm">Notifications</span>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-xs text-secondary font-bold cursor-pointer hover:underline">Mark all read</button>
                    <button onClick={(e) => { e.stopPropagation(); setNotifOpen(false); }} className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <span className="material-symbols-outlined text-slate-300 text-2xl mb-2 block">notifications_off</span>
                      <p className="text-xs text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => { markAsRead(n.id); setNotifOpen(false); }}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className="mt-0.5">{getIcon(n.type)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-primary">{n.title}</span>
                            {!n.read && <span className="w-2 h-2 bg-secondary rounded-full mt-1.5 shrink-0"></span>}
                          </div>
                          <p className="text-xs text-slate-500">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Help */}
          <button
            onClick={() => window.open('https://docs.google.com', '_blank')}
            title="Open Help Center"
            className="material-symbols-outlined text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          >
            help_outline
          </button>
        </div>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <div className="font-manrope text-sm font-semibold tracking-tight text-blue-900">{displayName}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{displayRole}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            {displayName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
