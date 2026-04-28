import { useState } from "react";
import { useSchedule } from "../../context/ScheduleContext";

export function meta() {
  return [{ title: "ERUDITE - Class Schedule" }];
}

const DAYS = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function StudentSchedule() {
  const [dayFilter, setDayFilter] = useState("All");
  const { events } = useSchedule();

  const filtered = dayFilter === "All" ? events : events.filter((s) => s.day === dayFilter);

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Class Schedule</h1>
          <p className="text-on-surface-variant font-body">Your weekly timetable of lectures, labs, and workshops.</p>
        </div>
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="bg-surface-container-high text-primary px-5 py-3 rounded-lg font-bold text-sm outline-none cursor-pointer"
        >
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((item, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-6">
            <div className="w-28 shrink-0">
              <div className="text-sm font-bold text-primary">{item.day}</div>
              <div className="text-xs text-slate-500 mt-1">{item.time}</div>
            </div>
            <div className="h-10 w-px bg-slate-200"></div>
            <div className="flex-1">
              <div className="font-bold text-primary">{item.course}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {item.room}
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              item.type === 'Lecture' ? 'bg-blue-50 text-blue-700' :
              item.type === 'Workshop' ? 'bg-green-50 text-green-700' :
              'bg-purple-50 text-purple-700'
            }`}>{item.type}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 font-medium">No classes scheduled for this day.</div>
        )}
      </div>
    </div>
  );
}
