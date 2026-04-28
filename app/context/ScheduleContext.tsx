import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import apiClient from "~/services/api";
import { useAuth } from "~/context/AuthContext";

export interface ScheduleEvent {
  id: string;
  day: string;
  time: string;
  course: string;
  room: string;
  type: string;
}

interface ScheduleContextType {
  events: ScheduleEvent[];
  addEvent: (event: Omit<ScheduleEvent, "id">) => void;
  loading: boolean;
}

const ScheduleContext = createContext<ScheduleContextType>({
  events: [],
  addEvent: () => {},
  loading: false,
});

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSchedules = async () => {
      try {
        const res = await apiClient.get('/schedules');
        const data = res.data.data || res.data;
        const formattedEvents = (Array.isArray(data) ? data : []).map((schedule: any) => ({
          id: schedule.id,
          day: schedule.day_of_week,
          time: `${schedule.start_time} – ${schedule.end_time}`,
          course: schedule.course?.name || 'Course',
          room: schedule.location || 'TBA',
          type: 'Lecture'
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
        // Fallback: load from localStorage or use empty array
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("erudite_schedule");
          if (stored) {
            setEvents(JSON.parse(stored));
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("erudite_schedule", JSON.stringify(events));
    }
  }, [events]);

  async function addEvent(event: Omit<ScheduleEvent, "id">) {
    // Optimistically add to local state
    const tempId = Date.now().toString();
    setEvents((prev) => [...prev, { ...event, id: tempId }]);

    try {
      // Try to persist via API if we have a course context
      await apiClient.post('/schedules', {
        course_id: 1, // Default course - will be overridden by backend if needed
        day_of_week: event.day,
        start_time: event.time.split(' – ')[0]?.trim() || '09:00',
        end_time: event.time.split(' – ')[1]?.trim() || '10:00',
        location: event.room,
      });
    } catch (error) {
      // API call failed - keep local state as fallback (localStorage will persist)
      console.warn('Schedule API save failed, keeping local state:', error);
    }
  }

  return (
    <ScheduleContext.Provider value={{ events, addEvent, loading }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
}
