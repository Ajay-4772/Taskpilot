import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { auth, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getTasks } from "../services/taskService";
import { User, Mail, Lock, Calendar, Trash2, Camera, ShieldAlert, Award, FileText, CheckCircle2, Clock } from "lucide-react";
import ConfirmModal from "../components/common/ConfirmModal";

const ProfileSettings = () => {
  const { user, updateUserProfile, updateUserEmail, sendPasswordReset } = useAuth();
  const { showToast } = useToast();

  // Name State
  const [name, setName] = useState(user?.displayName || "");
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  // File Upload State
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

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
      setPhotoPreview(user.photoURL || null);
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

  const getInitials = (nameStr) => {
    if (!nameStr) return "U";
    return nameStr.charAt(0).toUpperCase();
  };

  // HTML5 Canvas client-side photo compression
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/jpeg", 0.8);
        };
      };
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit.", "error");
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("Unsupported file format. Please upload PNG, JPEG, or WEBP.", "error");
      return;
    }

    setPhotoLoading(true);
    try {
      const compressedBlob = await compressImage(file);
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateUserProfile(user.displayName, downloadURL);
      setPhotoPreview(downloadURL);
      showToast("Profile picture updated successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to upload profile picture.", "error");
    } finally {
      setPhotoLoading(false);
    }
  };

  const triggerRemovePhotoConfirm = () => {
    if (!photoPreview) return;
    setConfirmModal({
      isOpen: true,
      title: "Remove Profile Picture?",
      message: "Are you sure you want to delete your profile photo? Your avatar will reset to your workspace initials.",
      type: "danger",
      confirmText: "Delete Photo",
      onConfirm: handleRemovePhoto
    });
  };

  const handleRemovePhoto = async () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setPhotoLoading(true);
    try {
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      try {
        await deleteObject(storageRef);
      } catch (err) {
        console.warn("Storage item not found, resetting URL directly.", err);
      }
      await updateUserProfile(user.displayName, "");
      setPhotoPreview(null);
      showToast("Profile picture removed successfully.", "info");
    } catch (error) {
      console.error(error);
      showToast("Failed to remove profile picture.", "error");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    
    setNameLoading(true);
    try {
      await updateUserProfile(name.trim(), photoPreview || "");
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

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 flex-grow select-none">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight mb-1 text-[var(--text-main)]">Profile Details</h2>
        <p className="text-xs text-[var(--text-muted)] font-medium">Manage workspace configurations and credential settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left pane: Photo Upload & Info summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm flex flex-col items-center text-center">
            
            {/* Uploadable profile picture bubble */}
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-extrabold shadow-md bg-zinc-950 border border-zinc-800 select-none relative">
                {photoPreview ? (
                  <img src={photoPreview} alt={user?.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(user?.displayName || user?.email)}</span>
                )}
                
                {/* Photo loading overlay spinner */}
                {photoLoading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload button hover mask */}
              <label className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full border border-zinc-800 cursor-pointer shadow-md hover:scale-105 transition-all flex items-center justify-center">
                <Camera size={13} />
                <input type="file" onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/webp" disabled={photoLoading} />
              </label>
            </div>

            <h3 className="text-sm font-bold text-[var(--text-main)] mb-0.5">
              {user?.displayName || "Workspace Member"}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-semibold mb-4 break-all max-w-full">
              {user?.email}
            </p>

            <div className="flex gap-2 w-full justify-center">
              <button
                type="button"
                onClick={triggerRemovePhotoConfirm}
                className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-950/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 text-[9px] font-bold transition-all cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!photoPreview || photoLoading}
              >
                Remove Photo
              </button>
            </div>

            <div className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-50 dark:bg-zinc-900 border border-[var(--border-color)] rounded-lg text-[9px] text-[var(--text-muted)] font-bold mt-6 w-full justify-center">
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
