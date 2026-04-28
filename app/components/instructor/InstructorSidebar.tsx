import { useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { href: "/instructor/dashboard", icon: "space_dashboard", label: "Dashboard" },
  { href: "/instructor/my-courses", icon: "auto_stories", label: "My Courses" },
  { href: "/instructor/submissions", icon: "assignment_turned_in", label: "Submissions" },
  { href: "/instructor/students", icon: "groups", label: "Students" },
  { href: "/instructor/inbox", icon: "mail", label: "Inbox" },
  { href: "/instructor/schedule", icon: "calendar_month", label: "Schedule" },
  { href: "/instructor/settings", icon: "settings", label: "Settings" },
];

export function InstructorSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-slate-100 flex flex-col py-8 px-4">
      <div className="font-manrope text-2xl font-black text-blue-950 px-4 mb-2">ERUDITE</div>
      <div className="px-4 mb-8 text-[10px] font-manrope font-bold text-secondary uppercase tracking-[0.2em]">Instructor Portal</div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-blue-950 shadow-sm font-bold"
                  : "text-slate-600 hover:text-blue-900 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              <span className="font-manrope font-bold text-xs uppercase tracking-widest">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="mt-auto space-y-1">
        <button onClick={() => window.open('https://docs.google.com', '_blank')} className="w-full text-slate-600 flex items-center px-4 py-3 hover:text-blue-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer">
          <span className="material-symbols-outlined mr-3">contact_support</span>
          <span className="font-manrope font-bold text-xs uppercase tracking-widest">Support</span>
        </button>
        <button
          onClick={() => { logout(); window.location.href = "/login"; }}
          className="w-full text-slate-600 flex items-center px-4 py-3 hover:text-blue-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          <span className="font-manrope font-bold text-xs uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  );
}
