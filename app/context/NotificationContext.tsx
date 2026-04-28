import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { notificationsApi } from "../services/api";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API on mount or when user changes
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [user]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll();
      setNotifications(
        response.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: (n.type || 'info') as NotificationType,
          timestamp: n.created_at,
          read: !!n.read_at,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  // Sort notifications by timestamp
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const unreadCount = sortedNotifications.filter(n => !n.read).length;

  async function addNotification(n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: AppNotification = {
      ...n,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }

  async function markAsRead(id: number) {
    // Optimistically update UI first
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    
    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Revert on error
      await fetchNotifications();
    }
  }

  async function markAllAsRead() {
    // Optimistically update UI first
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    
    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      // Revert on error
      await fetchNotifications();
    }
  }

  function clearAll() {
    // Optimistically clear UI
    setNotifications([]);
    
    // Call API to clear on backend
    notificationsApi.clearAll().catch(err => {
      console.error("Failed to clear notifications:", err);
      // Refetch if error
      fetchNotifications();
    });
  }

  return (
    <NotificationContext.Provider value={{
      notifications: sortedNotifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
