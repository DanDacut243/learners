import { useState } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";
import { useAuth } from "../../context/AuthContext";

export function meta() {
  return [{ title: "ERUDITE - Student Settings" }];
}

export default function StudentSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock states
  const [reminders, setReminders] = useState(true);
  const [accessibility, setAccessibility] = useState(false);

  // Profile states - initialize from authenticated user
  const [fullName, setFullName] = useState(user?.name || "");

  async function handleSave() {
    try {
      if (user?.id) {
        await apiClient.put(`/users/${user.id}`, {
          name: fullName
        });
        toast("Settings updated successfully and saved to database", "success");
      }
    } catch (error) {
      toast("Failed to save settings", "error");
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Student Settings</h1>
        <p className="text-on-surface-variant font-body">Manage your profile, study reminders, and preferences.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button onClick={() => setActiveTab("profile")} className={`px-6 py-4 font-bold text-sm transition-colors cursor-pointer ${activeTab === "profile" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:bg-slate-50"}`}>
            Profile
          </button>
          <button onClick={() => setActiveTab("preferences")} className={`px-6 py-4 font-bold text-sm transition-colors cursor-pointer ${activeTab === "preferences" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:bg-slate-50"}`}>
            Preferences
          </button>
          <button onClick={() => setActiveTab("security")} className={`px-6 py-4 font-bold text-sm transition-colors cursor-pointer ${activeTab === "security" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:bg-slate-50"}`}>
            Security
          </button>
        </div>

        <div className="p-8">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input type="email" defaultValue={user?.email || ''} disabled className="w-full bg-slate-100 text-slate-400 border-none rounded-lg px-4 py-3 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Major</label>
                  <input type="text" defaultValue="Computer Science" disabled className="w-full bg-slate-100 text-slate-400 border-none rounded-lg px-4 py-3 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2">Study & Accessibility</h3>
              
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800">Upcoming Deadline Reminders</div>
                  <div className="text-sm text-slate-500">Receive email alerts 48 hours before assignments are due.</div>
                </div>
                <button onClick={() => setReminders(!reminders)} className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${reminders ? "bg-primary" : "bg-slate-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${reminders ? "left-7" : "left-1"}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800">High Contrast Mode</div>
                  <div className="text-sm text-slate-500">Enhance text visibility across the learning platform.</div>
                </div>
                <button onClick={() => setAccessibility(!accessibility)} className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${accessibility ? "bg-primary" : "bg-slate-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${accessibility ? "left-7" : "left-1"}`}></div>
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2">Change Password</h3>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
              <span className="material-symbols-outlined">save</span>
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
