// Admin System Settings
import { useState } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";
import { useAuth } from "../../context/AuthContext";

export function meta() {
  return [{ title: "ERUDITE - System Settings" }];
}

const TABS = [
  { id: "general", icon: "tune", label: "General" },
  { id: "security", icon: "security", label: "Security" },
  { id: "notifications", icon: "notifications_active", label: "Notifications" },
  { id: "api", icon: "api", label: "API Integrations" },
];

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [platformName, setPlatformName] = useState("ERUDITE Learning");
  const [supportEmail, setSupportEmail] = useState("support@erudite.edu");
  const [announcement, setAnnouncement] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [toggles, setToggles] = useState({
    publicCatalog: true,
    aiAssistant: true,
    deviceLimits: false,
    twoFactor: true,
    auditLog: true,
    emailNotifs: true,
    slackNotifs: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  function flipToggle(key: keyof typeof toggles) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      // Save settings to database via API
      await apiClient.put('/settings', {
        platform_name: platformName,
        support_email: supportEmail,
        announcement: announcement,
        session_timeout: sessionTimeout,
        settings: toggles
      });
      toast("Settings saved successfully and updated in database!", "success");
    } catch (error) {
      toast("Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  }

  function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${checked ? "bg-secondary" : "bg-slate-200"}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${checked ? "right-0.5" : "left-0.5"} ${!checked ? "border border-slate-100" : ""}`}></div>
      </button>
    );
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">System Settings</h1>
        <p className="text-on-surface-variant font-body">Configure global platform parameters, security, and integration options.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Settings Navigation */}
        <div className="col-span-12 md:col-span-3">
          <nav className="space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-surface-container-low text-primary font-bold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary font-semibold"
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="col-span-12 md:col-span-9 space-y-8">
          {activeTab === "general" && (
            <>
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-slate-100">Platform Identity</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600">Platform Name</label>
                      <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600">Support Email</label>
                      <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-600">Global Announcement</label>
                    <textarea rows={3} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Enter an announcement to display to all users..." className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-slate-100">Features</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-primary text-sm">Public Course Catalog</h4>
                      <p className="text-xs text-slate-500 mt-1">Allow non-registered users to view published courses.</p>
                    </div>
                    <Toggle checked={toggles.publicCatalog} onToggle={() => flipToggle("publicCatalog")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-primary text-sm">AI Tutor (Gemini-Powered)</h4>
                      <p className="text-xs text-slate-500 mt-1">Enable the AI Tutor in the Learning Room. Requires a Gemini API key in backend .env.</p>
                    </div>
                    <Toggle checked={toggles.aiAssistant} onToggle={() => flipToggle("aiAssistant")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-primary text-sm">Strict Device Limits</h4>
                      <p className="text-xs text-slate-500 mt-1">Prevent users from logging in on more than 3 devices simultaneously.</p>
                    </div>
                    <Toggle checked={toggles.deviceLimits} onToggle={() => flipToggle("deviceLimits")} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-slate-100">Security Policy</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-primary text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 mt-1">Require 2FA for all admin and instructor accounts.</p>
                  </div>
                  <Toggle checked={toggles.twoFactor} onToggle={() => flipToggle("twoFactor")} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-primary text-sm">Audit Logging</h4>
                    <p className="text-xs text-slate-500 mt-1">Log all administrative actions for compliance review.</p>
                  </div>
                  <Toggle checked={toggles.auditLog} onToggle={() => flipToggle("auditLog")} />
                </div>
                <div className="flex flex-col gap-2 pb-6 border-b border-slate-100">
                  <label className="text-sm font-bold text-slate-600">Session Timeout (minutes)</label>
                  <input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))} className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none w-32" />
                </div>

                <div>
                  <h4 className="font-bold text-primary text-sm mb-4">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600">Current Password</label>
                      <input type="password" placeholder="••••••••" className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600">New Password</label>
                      <input type="password" placeholder="••••••••" className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600">Confirm Password</label>
                      <input type="password" placeholder="••••••••" className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-slate-100">Notification Channels</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-primary text-sm">Email Notifications</h4>
                    <p className="text-xs text-slate-500 mt-1">Send system alerts and reports via email.</p>
                  </div>
                  <Toggle checked={toggles.emailNotifs} onToggle={() => flipToggle("emailNotifs")} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-primary text-sm">Slack Integration</h4>
                    <p className="text-xs text-slate-500 mt-1">Push critical alerts to a Slack channel.</p>
                  </div>
                  <Toggle checked={toggles.slackNotifs} onToggle={() => flipToggle("slackNotifs")} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-primary mb-6 pb-4 border-b border-slate-100">API Keys</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div>
                    <div className="font-bold text-primary text-sm">Production Key</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">sk_live_••••••••••••3f8a</div>
                  </div>
                  <button onClick={() => toast("API key copied to clipboard")} className="text-sm font-bold text-secondary hover:text-primary transition-colors cursor-pointer">Copy</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div>
                    <div className="font-bold text-primary text-sm">Sandbox Key</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">sk_test_••••••••••••9b2c</div>
                  </div>
                  <button onClick={() => toast("API key copied to clipboard")} className="text-sm font-bold text-secondary hover:text-primary transition-colors cursor-pointer">Copy</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button onClick={handleSave} disabled={isSaving} className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50">
              {isSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
