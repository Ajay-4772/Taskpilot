import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { auth } from "../firebase/firebaseConfig";
import { getTasks } from "../services/taskService";
import { User, Mail, Lock, Calendar, ShieldAlert, Award, FileText, CheckCircle2, Clock } from "lucide-react";
import ConfirmModal from "../components/common/ConfirmModal";

const ProfileSettings = () => {
  const { user, updateUserProfile, updateUserEmail, sendPasswordReset } = useAuth();
  const { showToast } = useToast();

  // Name State
  const [name, setName] = useState(user?.displayName || "");
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  // Change Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Task Statistics State
  const [tasks, setTasks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    confirmText: "Confirm",
    onConfirm: () => {}
  });

  // Load user tasks to compute live stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      console.error("Failed to load user task metrics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
    }
  }, [user]);

  // Compute live task statistics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, inProgress, rate };
  }, [tasks]);

  // Generate dynamic recent activity logs
  const recentActivities = useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map((t) => ({
        id: t._id,
        text: t.status === "Completed" ? `Completed task "${t.title}"` : `Added task "${t.title}" to workspace`,
        time: t.updatedAt || t.createdAt
      }));
  }, [tasks]);

  const getCreationDate = () => {
    const rawDate = auth.currentUser?.metadata?.creationTime;
    if (!rawDate) return "N/A";
    return new Date(rawDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Upgraded Initials Generator supporting 2 characters
  const getInitials = (nameStr) => {
    if (!nameStr) return "U";
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Hashing helper to return a consistent visual theme color derived from display name
  const getAvatarColor = (nameStr) => {
    if (!nameStr) return "#6366f1"; // Default Indigo
    const colors = [
      "#ef4444", // Red
      "#f97316", // Orange
      "#f59e0b", // Amber
      "#10b981", // Emerald
      "#06b6d4", // Cyan
      "#3b82f6", // Blue
      "#6366f1", // Indigo
      "#8b5cf6", // Violet
      "#d946ef", // Fuchsia
      "#ec4899"  // Pink
    ];
    let hash = 0;
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    
    setNameLoading(true);
    try {
      await updateUserProfile(name.trim(), "");
      showToast("Display name updated successfully!", "success");
      setIsNameEditing(false);
    } catch (err) {
      showToast(err.message || "Failed to update display name", "error");
    } finally {
      setNameLoading(false);
    }
  };

  const triggerPasswordResetConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Account Password?",
      message: "A password reset link will be dispatched to your registered email. You will use the link to configure your credentials.",
      type: "warning",
      confirmText: "Send Reset Link",
      onConfirm: handlePasswordReset
    });
  };

  const handlePasswordReset = async () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      await sendPasswordReset();
      showToast("Password reset link sent successfully.", "success");
    } catch (err) {
      showToast("Failed to send password reset email.", "error");
    }
  };

  const handleEmailChangeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast("New email is required.", "error");
      return;
    }
    if (!emailPassword) {
      showToast("Verification password is required.", "error");
      return;
    }

    setEmailLoading(true);
    try {
      await updateUserEmail(emailPassword, newEmail.trim());
      showToast("Verification link sent! Changes take effect when verified.", "success");
      setIsEmailModalOpen(false);
      setNewEmail("");
      setEmailPassword("");
    } catch (err) {
      showToast(err.message || "Failed to change email credentials.", "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const displayName = user?.displayName || user?.email || "Workspace Member";

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 flex-grow select-none">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight mb-1 text-[var(--text-main)]">Profile Details</h2>
        <p className="text-xs text-[var(--text-muted)] font-medium">Manage workspace configurations and credential settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane: Consistent Colored Initials Avatar & Info summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm flex flex-col items-center text-center">
            
            {/* Hashed background Initials avatar */}
            <div className="mb-4">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-md select-none border border-zinc-200 dark:border-zinc-800"
                style={{ backgroundColor: getAvatarColor(displayName) }}
              >
                {getInitials(displayName)}
              </div>
            </div>

            <h3 className="text-sm font-bold text-[var(--text-main)] mb-0.5">
              {user?.displayName || "Workspace Member"}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-semibold mb-4 break-all max-w-full">
              {user?.email}
            </p>

            <div className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-50 dark:bg-zinc-900 border border-[var(--border-color)] rounded-lg text-[9px] text-[var(--text-muted)] font-bold mt-2 w-full justify-center">
              <Calendar size={11} />
              <span>Member Since: {getCreationDate()}</span>
            </div>
          </div>

          {/* Task stats display card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
              <Award size={13} />
              <span>Workspace Statistics</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block mb-0.5">Completed</span>
                <span className="text-sm font-extrabold text-[var(--text-main)]">{metrics.completed}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block mb-0.5">In Progress</span>
                <span className="text-sm font-extrabold text-[var(--text-main)]">{metrics.inProgress}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block mb-0.5">Pending</span>
                <span className="text-sm font-extrabold text-[var(--text-main)]">{metrics.pending}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-[var(--border-color)]">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block mb-0.5">Completion Rate</span>
                <span className="text-sm font-extrabold text-[var(--text-main)]">{metrics.rate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Monochrome setting details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Change Display Name */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-main)]">Profile Name</h4>
                <p className="text-[9px] text-[var(--text-muted)]">Your display name across the workspace</p>
              </div>
              {!isNameEditing && (
                <button
                  type="button"
                  onClick={() => setIsNameEditing(true)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-black dark:hover:border-white text-[9px] font-bold text-[var(--text-main)] transition-colors cursor-pointer bg-transparent"
                >
                  Edit Name
                </button>
              )}
            </div>

            {isNameEditing ? (
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                      disabled={nameLoading}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setName(user?.displayName || "");
                      setIsNameEditing(false);
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer bg-transparent text-[var(--text-main)]"
                    disabled={nameLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold transition-colors cursor-pointer border-0"
                    disabled={nameLoading}
                  >
                    {nameLoading ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4 py-1">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-[var(--border-color)]">
                  <User size={15} className="text-[var(--text-main)]" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block tracking-wider">Workspace Name</span>
                  <span className="text-xs font-bold text-[var(--text-main)]">{user?.displayName || "Not configured"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Secure Workflows: Reset Password & Change Email */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[var(--border-color)]">
              <h4 className="text-xs font-bold text-[var(--text-main)]">Security Workflows</h4>
              <p className="text-[9px] text-[var(--text-muted)]">Secure modifications verified via email workflows</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Change Email Button Card */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border-color)] p-4 rounded-xl flex flex-col justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-[var(--text-main)] flex items-center gap-1">
                    <Mail size={12} />
                    <span>Workspace Email</span>
                  </span>
                  <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                    Update your primary account email. This requires verification before changing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold transition-all cursor-pointer border-0"
                >
                  Change Email
                </button>
              </div>

              {/* Reset Password Button Card */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-[var(--border-color)] p-4 rounded-xl flex flex-col justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-[var(--text-main)] flex items-center gap-1">
                    <Lock size={12} />
                    <span>Workspace Password</span>
                  </span>
                  <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                    Request an official Firebase password reset link sent to your current email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerPasswordResetConfirm}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-black dark:hover:border-white text-[10px] font-bold text-[var(--text-main)] transition-colors cursor-pointer bg-transparent"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
              <Clock size={13} />
              <span>Recent Activity</span>
            </h4>

            {recentActivities.length === 0 ? (
              <p className="text-[10px] text-[var(--text-muted)] italic font-semibold">No recent activity logs available.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-center gap-3 text-[10px] py-1 border-b border-zinc-50 dark:border-zinc-900/40 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                    <span className="text-[var(--text-muted)] flex-grow font-medium">{act.text}</span>
                    <span className="text-[8px] text-zinc-450 shrink-0">
                      {new Date(act.time).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Re-authenticate & Change Email Modal overlay */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEmailModalOpen(false)} />
          <div className="relative z-10 w-full max-w-[400px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 shadow-2xl">
            <h3 className="text-sm font-extrabold mb-3 text-[var(--text-main)]">Change Primary Email</h3>
            <p className="text-[9px] text-[var(--text-muted)] mb-5 leading-normal">
              Changing your email requires re-authenticating with your current password. A verification link will be dispatched to the new address.
            </p>

            <form onSubmit={handleEmailChangeSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new@example.com"
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                    disabled={emailLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Verify Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                    disabled={emailLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer bg-transparent text-[var(--text-main)]"
                  disabled={emailLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold transition-colors cursor-pointer border-0"
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog overlay */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
    </div>
  );
};

export default ProfileSettings;
