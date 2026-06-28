import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { auth } from "../firebase/firebaseConfig";
import { User, Mail, Lock, Calendar, Eye, EyeOff, Check, X, ShieldAlert } from "lucide-react";
import ConfirmModal from "../components/common/ConfirmModal";

const ProfileSettings = () => {
  const { user, updateUserProfile, updateUserEmail, updateUserPassword } = useAuth();
  const { showToast } = useToast();

  // Name State
  const [name, setName] = useState(user?.displayName || "");
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  // Email State
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    confirmText: "Confirm",
    onConfirm: () => {}
  });

  // Sync details
  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
    }
  }, [user]);

  // Read metadata dates
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

  const checkPasswordStrength = (pass) => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const strength = checkPasswordStrength(newPassword);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    
    setNameLoading(true);
    try {
      await updateUserProfile(name);
      showToast("Display name updated successfully!", "success");
      setIsNameEditing(false);
    } catch (err) {
      showToast(err.message || "Failed to update display name", "error");
    } finally {
      setNameLoading(false);
    }
  };

  // Open confirmation modal for email change
  const triggerEmailConfirm = (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast("New email address is required.", "error");
      return;
    }
    if (!emailPassword) {
      showToast("Password confirmation is required to authenticate.", "error");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Update Email Address?",
      message: `You are about to change your account email to ${newEmail}. This requires verifying the link sent to the new address before completing.`,
      type: "email",
      confirmText: "Verify & Update",
      onConfirm: executeEmailChange
    });
  };

  const executeEmailChange = async () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setEmailLoading(true);
    try {
      await updateUserEmail(emailPassword, newEmail);
      showToast("Verification link sent! Please activate it to complete changes.", "success");
      setNewEmail("");
      setEmailPassword("");
    } catch (err) {
      showToast(err.message || "Failed to update email.", "error");
    } finally {
      setEmailLoading(false);
    }
  };

  // Open confirmation modal for password change
  const triggerPasswordConfirm = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Current password is required.", "error");
      return;
    }
    if (strength.score < 5) {
      showToast("New password must satisfy all security requirements.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (currentPassword === newPassword) {
      showToast("New password cannot match the current password.", "error");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Change Account Password?",
      message: "Are you sure you want to change your login credentials? You will remain signed in.",
      type: "password",
      confirmText: "Change Password",
      onConfirm: executePasswordChange
    });
  };

  const executePasswordChange = async () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setPasswordLoading(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      showToast("Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message || "Failed to change password.", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8 flex-grow select-none">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight mb-1 text-[var(--text-main)]">Profile Settings</h2>
        <p className="text-xs text-[var(--text-muted)] font-medium">Manage your TaskFlow credentials and workspace details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left pane: Modern initials avatar */}
        <div className="md:col-span-1">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md bg-zinc-950 border border-zinc-800 mb-4 select-none">
              {getInitials(user?.displayName || user?.email)}
            </div>

            <h3 className="text-sm font-bold text-[var(--text-main)] mb-0.5">
              {user?.displayName || "Workspace Member"}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-semibold mb-4 break-all max-w-full">
              {user?.email}
            </p>

            <div className="flex items-center gap-1.5 py-1 px-3 bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)] rounded-lg text-[9px] text-[var(--text-muted)] font-bold">
              <Calendar size={11} />
              <span>Joined {getCreationDate()}</span>
            </div>
          </div>
        </div>

        {/* Right pane: Monochrome B&W setting details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Change Display Name */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-main)]">Workspace Details</h4>
                <p className="text-[9px] text-[var(--text-muted)]">Your display identity</p>
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
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Workspace Name</label>
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

          {/* Change Email */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[var(--border-color)]">
              <h4 className="text-xs font-bold text-[var(--text-main)]">Change Email Address</h4>
              <p className="text-[9px] text-[var(--text-muted)]">Re-authentication is required to update email credentials</p>
            </div>

            <form onSubmit={triggerEmailConfirm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      type={showEmailPass ? "text" : "password"}
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-10 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                      disabled={emailLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPass(!showEmailPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      {showEmailPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold transition-colors cursor-pointer border-0"
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Update Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[var(--border-color)]">
              <h4 className="text-xs font-bold text-[var(--text-main)]">Change Password</h4>
              <p className="text-[9px] text-[var(--text-muted)]">Requires re-authentication prior to credential replacement</p>
            </div>

            <form onSubmit={triggerPasswordConfirm} className="space-y-4">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPass.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-10 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                    disabled={passwordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    {showPass.current ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type={showPass.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-10 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      {showPass.new ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2 pl-10 pr-10 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      {showPass.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength checklist display */}
              {newPassword && (
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-[var(--border-color)] p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <span>Password Strength</span>
                    <span className={`font-bold ${
                      strength.score <= 2 ? "text-red-500" : strength.score <= 4 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {strength.score <= 2 ? "Weak" : strength.score <= 4 ? "Good" : "Excellent"}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`h-1.5 rounded-full transition-all ${
                          strength.score >= level 
                            ? strength.score <= 2 
                              ? "bg-red-500" 
                              : strength.score <= 4 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                            : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-[var(--text-muted)] font-medium">
                    <div className="flex items-center gap-1">
                      {strength.checks.length ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-500 shrink-0" />}
                      <span>Min 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {strength.checks.uppercase ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-500 shrink-0" />}
                      <span>One uppercase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {strength.checks.lowercase ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-500 shrink-0" />}
                      <span>One lowercase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {strength.checks.number ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-500 shrink-0" />}
                      <span>One digit</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      {strength.checks.special ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-500 shrink-0" />}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold transition-colors cursor-pointer border-0"
                  disabled={passwordLoading || (newPassword && strength.score < 5)}
                >
                  {passwordLoading ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Change Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

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
