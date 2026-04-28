import { useState } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export function GlobalNotificationWidget() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render the widget if the user is not logged in
  if (!user) return null;

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
    <>
      {/* Floating Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center hover:shadow-xl transition-all z-50 group cursor-pointer"
      >
        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors text-[28px]">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-3.5 h-3.5 bg-error rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[600px] animate-in slide-in-from-bottom-5">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-secondary/10 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={markAllAsRead} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer" title="Mark all as read">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Close">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">notifications_off</span>
                <p className="text-sm font-bold text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">We'll let you know when something arrives.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 rounded-xl flex gap-3 transition-colors cursor-pointer ${n.read ? 'hover:bg-slate-50 opacity-70' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                  >
                    <div className="mt-0.5">{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className={`text-sm ${n.read ? 'font-semibold text-slate-700' : 'font-bold text-primary'}`}>{n.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{formatTime(n.timestamp)}</span>
                      </div>
                      <p className={`text-xs ${n.read ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>{n.message}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-secondary rounded-full mt-1.5 flex-shrink-0"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-error transition-colors cursor-pointer flex items-center justify-center w-full gap-1">
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
