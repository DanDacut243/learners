import { useAnnouncement } from "../../context/AnnouncementContext";

export function GlobalAnnouncement() {
  const { announcements } = useAnnouncement();

  if (!announcements || announcements.length === 0) return null;

  const latestAnnouncement = announcements[0];

  return (
    <div className="bg-gradient-to-r from-secondary to-blue-600 text-white text-sm font-bold py-2.5 px-4 text-center shadow-md relative z-[100] flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-[18px]">campaign</span>
      {latestAnnouncement.title}
    </div>
  );
}
