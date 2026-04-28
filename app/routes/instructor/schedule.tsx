import { useState } from "react";
import { useSchedule } from "../../context/ScheduleContext";
import { useToast } from "../../components/shared/Toast";

export function meta() {
  return [{ title: "ERUDITE - Teaching Schedule" }];
}

const DAYS = ["All", "Monday", "Wednesday", "Thursday", "Friday"];

export default function InstructorSchedule() {
  const [dayFilter, setDayFilter] = useState("All");
  const { events, addEvent } = useSchedule();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [formDay, setFormDay] = useState("Monday");
  const [formTime, setFormTime] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formType, setFormType] = useState("Lecture");

  function handleAdd() {
    if (!formTime || !formCourse) return;
    addEvent({
      day: formDay,
      time: formTime,
      course: formCourse,
      room: formRoom || "TBD",
      type: formType
    });
    setModalOpen(false);
    toast("Event added to schedule successfully");
  }

  const filtered = dayFilter === "All" ? events : events.filter((s) => s.day === dayFilter);

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Teaching Schedule</h1>
          <p className="text-on-surface-variant font-body">Your weekly lecture, workshop, and office hour timetable.</p>
        </div>
        <div className="flex gap-4">
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="bg-surface-container-high text-primary px-5 py-3 rounded-lg font-bold text-sm outline-none cursor-pointer"
          >
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={() => setModalOpen(true)} className="bg-primary text-white px-5 py-3 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Event
          </button>
        </div>
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
              item.type === 'Lab' ? 'bg-purple-50 text-purple-700' :
              'bg-amber-50 text-amber-700'
            }`}>{item.type}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 font-medium">No classes scheduled for this day.</div>
        )}
      </div>

      {/* Add Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[90] flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-primary mb-6">Add New Event</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-600">Day</label>
                  <select value={formDay} onChange={(e) => setFormDay(e.target.value)} className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer">
                    {DAYS.filter(d => d !== "All").map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-600">Time</label>
                  <input value={formTime} onChange={(e) => setFormTime(e.target.value)} placeholder="e.g. 2:00 PM - 3:00 PM" className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Event Title</label>
                <input value={formCourse} onChange={(e) => setFormCourse(e.target.value)} placeholder="e.g. Live Zoom Lecture" className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Location / Room</label>
                <input value={formRoom} onChange={(e) => setFormRoom(e.target.value)} placeholder="e.g. Zoom Link or Room 101" className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Type</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)} className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer">
                  <option>Lecture</option>
                  <option>Workshop</option>
                  <option>Lab</option>
                  <option>Office</option>
                  <option>Meeting</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAdd} className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
