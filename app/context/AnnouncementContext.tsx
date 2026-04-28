import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import apiClient from "~/services/api";
import { useAuth } from "~/context/AuthContext";

interface Announcement {
  id: string;
  title: string;
  content: string;
  visibility: string;
  created_at: string;
}

interface AnnouncementContextType {
  announcements: Announcement[];
  loading: boolean;
}

const AnnouncementContext = createContext<AnnouncementContextType>({
  announcements: [],
  loading: false,
});

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const res = await apiClient.get('/announcements');
        setAnnouncements(res.data.data || res.data);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      fetchAnnouncements();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [user]);

  return (
    <AnnouncementContext.Provider value={{ announcements, loading }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncement() {
  return useContext(AnnouncementContext);
}
