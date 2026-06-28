"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useTasks } from "@/store/tasksContext";
import api from "@/lib/api";
import {
  ArrowLeft,
  Camera,
  Edit2,
  Folder,
  Clock,
  Lock,
  Moon,
  Bell,
  Sparkles,
  Trash2,
  LogOut,
  Database,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  UserCheck,
  CheckCircle,
  AlertCircle
} from "lucide-react";

function ProfilePageContent() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, accessToken, refreshToken, setAuth, logout } = useAuthStore();
  const { tasks } = useTasks();

  // Local state for UI interactions
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.full_name || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  
  // Toggles
  const [notifications, setNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(false);

  // Submenus/Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-sync avatar preview when store updates
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarPreview(user.avatar_url);
    }
  }, [user?.avatar_url]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch document count using react-query
  const { data: docs = [] } = useQuery<any[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await api.get<any[]>("/documents");
      return res.data;
    },
    initialData: [],
  });

  const itemsCount = docs.length;
  const activitiesCount = tasks.length;

  const userInitials = (user?.full_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // 1. Edit Name
  function handleSaveName() {
    if (!newName.trim() || !user || !accessToken || !refreshToken) return;
    setAuth({ ...user, full_name: newName.trim() }, accessToken, refreshToken);
    setEditingName(false);
    showToast("Name updated successfully!", "success");
  }

  // 2. Avatar Upload
  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File too large — max 5MB", "error");
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Mock API call first, then local storage update
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      if (user && accessToken && refreshToken) {
        setAuth({ ...user, avatar_url: data.url }, accessToken, refreshToken);
      }
      showToast("Avatar uploaded successfully!", "success");
    } catch (err) {
      showToast("Could not upload photo. Set preview locally.", "info");
      // Fallback update just locally
      if (user && accessToken && refreshToken) {
        setAuth({ ...user, avatar_url: avatarPreview }, accessToken, refreshToken);
      }
    } finally {
      setUploadingAvatar(false);
    }
  }

  // 3. Change Password
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill all fields", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setPasswordStatus("loading");
    await new Promise((r) => setTimeout(r, 1200)); // Simulate API delay
    
    setPasswordStatus("success");
    showToast("Password updated successfully!", "success");
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordStatus("idle");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  }

  // 4. Clear Cache
  async function handleClearCache() {
    showToast("Clearing app cache...", "info");
    await new Promise((r) => setTimeout(r, 1000));
    showToast("Cache cleared successfully!", "success");
  }

  // 5. Help & Support / Privacy Policy
  function handleHelp() {
    alert("Support contact: support@cixiohub.io\nResponse time: Under 24 hours.");
  }

  function handlePrivacy() {
    alert("Privacy Policy:\nYour data is safely stored in local memory and within private PostgreSQL instance boundaries. We do not sell or track your usage metrics.");
  }

  // 6. Delete Account
  function handleDeleteAccount() {
    const confirmDelete = confirm("Are you sure you want to permanently delete your account? This action is irreversible and all your data will be wiped.");
    if (confirmDelete) {
      logout();
      router.push("/auth/login");
    }
  }

  // 7. Logout
  function handleLogout() {
    if (confirm("Log out of CixioHub?")) {
      logout();
      router.push("/auth/login");
    }
  }

  function showToast(message: string, type: "success" | "error" | "info") {
    setToast({ message, type });
  }

  return (
    <main className="min-h-screen bg-[#090F1C] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D1627] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        
        {/* Toast Notification */}
        {toast && (
          <div className={`absolute top-4 left-4 right-4 z-50 rounded-xl p-3 flex items-center gap-2 shadow-lg transition-all duration-300
            ${toast.type === "success" ? "bg-emerald-950 border border-emerald-800 text-emerald-300" : ""}
            ${toast.type === "error" ? "bg-rose-950 border border-rose-800 text-rose-300" : ""}
            ${toast.type === "info" ? "bg-sky-950 border border-sky-800 text-sky-300" : ""}
          `}>
            {toast.type === "success" && <CheckCircle size={16} />}
            {toast.type === "error" && <AlertCircle size={16} />}
            {toast.type === "info" && <Database size={16} />}
            <span className="text-xs font-medium">{toast.message}</span>
          </div>
        )}

        {/* ── Header Row ── */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-10 h-10 rounded-full bg-[#16223F] hover:bg-[#1E2E54] flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold tracking-wide">Profile</h1>
        </div>

        {/* ── Avatar Section ── */}
        <div className="flex flex-col items-center py-4 relative">
          <div className="relative w-28 h-28 mb-3">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-2 border-cyan-500/20"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#16223F] flex items-center justify-center text-3xl font-bold text-cyan-400 border-2 border-cyan-500/20">
                {userInitials}
              </div>
            )}
            
            {/* Camera Overlay Icon */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg hover:bg-cyan-400 active:scale-95 transition-all"
            >
              <Camera size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          {/* User Name & Edit Toggle */}
          <div className="flex items-center justify-center gap-2 mb-1 w-full px-8">
            {editingName ? (
              <div className="flex gap-2 w-full max-w-[240px]">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-[#16223F] border border-cyan-500/30 rounded-lg px-2 py-1 text-sm text-white focus:outline-none w-full text-center"
                  placeholder="Enter name"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-cyan-500 text-slate-950 px-2 py-1 rounded-lg text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => { setEditingName(false); setNewName(user?.full_name || ""); }}
                  className="text-slate-400 px-1 py-1 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold tracking-tight text-white truncate max-w-[200px]">
                  {user?.full_name || "Guest User"}
                </h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium tracking-wide">
            {user?.email || "guest@cixiohub.io"}
          </p>
        </div>

        {/* ── Stats Grid Card Row ── */}
        <div className="grid grid-cols-2 gap-4 px-6 py-2">
          {/* Items Card */}
          <div className="bg-[#131E35] border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 mb-2">
              <Folder size={18} />
            </div>
            <span className="text-xl font-bold text-white">{itemsCount}</span>
            <span className="text-xs text-slate-400 mt-0.5">Items</span>
          </div>

          {/* Activities Card */}
          <div className="bg-[#131E35] border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 mb-2">
              <Clock size={18} />
            </div>
            <span className="text-xl font-bold text-white">{activitiesCount}</span>
            <span className="text-xs text-slate-400 mt-0.5">Activities</span>
          </div>
        </div>

        {/* ── Settings Menu Items ── */}
        <div className="px-6 py-4 space-y-2.5 overflow-y-auto max-h-[380px] scrollbar-thin">
          
          {/* Edit Name Menu Item */}
          <button
            onClick={() => setEditingName(true)}
            className="w-full flex items-center justify-between bg-[#131E35] hover:bg-[#1A2846] border border-slate-800/80 rounded-2xl p-4 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Edit2 size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">Edit Name</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* Change Password Menu Item */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between bg-[#131E35] hover:bg-[#1A2846] border border-slate-800/80 rounded-2xl p-4 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">Change Password</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* Dark Mode Switch Toggle */}
          <div className="flex items-center justify-between bg-[#131E35] border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                theme === "dark" ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <span className={`w-5 h-5 rounded-full bg-slate-900 shadow transition-transform ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* Notifications Switch Toggle */}
          <div className="flex items-center justify-between bg-[#131E35] border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                notifications ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <span className={`w-5 h-5 rounded-full bg-slate-900 shadow transition-transform ${
                notifications ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* AI Suggestions Switch Toggle */}
          <div className="flex items-center justify-between bg-[#131E35] border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <button
              onClick={() => setAiSuggestions(!aiSuggestions)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                aiSuggestions ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <span className={`w-5 h-5 rounded-full bg-slate-900 shadow transition-transform ${
                aiSuggestions ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* Clear Cache */}
          <button
            onClick={handleClearCache}
            className="w-full flex items-center justify-between bg-[#131E35] hover:bg-[#1A2846] border border-slate-800/80 rounded-2xl p-4 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Database size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">Clear Cache</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* Help & Support */}
          <button
            onClick={handleHelp}
            className="w-full flex items-center justify-between bg-[#131E35] hover:bg-[#1A2846] border border-slate-800/80 rounded-2xl p-4 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">Help & Support</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* Privacy Policy */}
          <button
            onClick={handlePrivacy}
            className="w-full flex items-center justify-between bg-[#131E35] hover:bg-[#1A2846] border border-slate-800/80 rounded-2xl p-4 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <UserCheck size={16} className="text-cyan-400" />
              <span className="text-sm font-medium">Privacy Policy</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* Delete Account */}
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-between bg-[#131E35] hover:bg-rose-950/20 border border-slate-800/80 rounded-2xl p-4 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-rose-500 group-hover:text-rose-400" />
              <span className="text-sm font-medium text-rose-500 group-hover:text-rose-400">Delete Account</span>
            </div>
            <ChevronRight size={14} className="text-rose-500/60 group-hover:text-rose-500" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between bg-[#131E35] hover:bg-rose-950/20 border border-slate-800/80 rounded-2xl p-4 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-rose-500 group-hover:text-rose-400" />
              <span className="text-sm font-medium text-rose-500 group-hover:text-rose-400">Logout</span>
            </div>
            <ChevronRight size={14} className="text-rose-500/60 group-hover:text-rose-500" />
          </button>

        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1627] border border-slate-850 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Lock size={16} className="text-cyan-400" /> Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#131E35] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#131E35] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#131E35] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 border border-slate-800 text-slate-400 hover:text-white rounded-xl py-2 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus === "loading" || passwordStatus === "success"}
                  className="flex-1 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl py-2 text-xs font-semibold transition disabled:opacity-50"
                >
                  {passwordStatus === "loading" && "Saving…"}
                  {passwordStatus === "success" && "Saved ✓"}
                  {passwordStatus === "idle" && "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090F1C] flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading profile...</p>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
