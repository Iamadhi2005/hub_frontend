"use client";
// app/settings/page.tsx
// Settings page at /settings
// Preferences, integrations, and logout

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "preferences" | "account";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("preferences");
  const [saved, setSaved] = useState(false);

  // ── Preferences state ─────────────────────────────────────
  const [language,      setLanguage]      = useState("en");
  const [dateFormat,    setDateFormat]    = useState("MM/DD/YYYY");
  const [timeFormat,    setTimeFormat]    = useState("12h");
  const [startOfWeek,   setStartOfWeek]   = useState("monday");
  const [aiModel,       setAiModel]       = useState("ollama");
  const [autoSave,      setAutoSave]      = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleLogout() {
    if (!confirm("Log out of SmartHub?")) return;
    // TODO: clear auth token/cookie then redirect
    // await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "account",     label: "Account",     icon: "👤" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your preferences</p>
        </div>

        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="w-48 shrink-0">
            <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}

              {/* Logout button at the bottom of sidebar */}
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <span>🚪</span>
                  Log out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main panel */}
          <div className="flex-1">

            {/* ── PREFERENCES ── */}
            {activeTab === "preferences" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h2 className="text-base font-semibold text-gray-800">Preferences</h2>

                {/* Language */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ur">Urdu</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date format */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  {/* Time format */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Time format</label>
                    <select
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="12h">12-hour (2:30 PM)</option>
                      <option value="24h">24-hour (14:30)</option>
                    </select>
                  </div>
                </div>

                {/* Start of week */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Week starts on</label>
                  <select
                    value={startOfWeek}
                    onChange={(e) => setStartOfWeek(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                </div>

                {/* AI model */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Default AI model</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="ollama">Ollama (local)</option>
                    <option value="gpt4">GPT-4o</option>
                    <option value="claude">Claude 3.5</option>
                    <option value="gemini">Gemini Pro</option>
                  </select>
                </div>

                {/* Toggles */}
                {[
                  { key: "autoSave",         label: "Auto-save",         desc: "Automatically save notes and documents", value: autoSave,         set: setAutoSave         },
                  { key: "sidebarCollapsed", label: "Collapse sidebar",  desc: "Start with sidebar collapsed on load",   value: sidebarCollapsed, set: setSidebarCollapsed },
                ].map(({ key, label, desc, value, set }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-t border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => set((v: boolean) => !v)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save preferences
                  </button>
                  {saved && <span className="text-sm text-green-600">✓ Saved</span>}
                </div>
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {activeTab === "account" && (
              <div className="space-y-4">
                {/* Data export */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Export your data</h2>
                  <p className="text-xs text-gray-400 mb-4">Download all your notes, tasks, and documents as a ZIP file.</p>
                  <button className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                    📦 Export data
                  </button>
                </div>

                {/* Logout */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Log out</h2>
                  <p className="text-xs text-gray-400 mb-4">You will be redirected to the login page.</p>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-red-50 border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    🚪 Log out of SmartHub
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
