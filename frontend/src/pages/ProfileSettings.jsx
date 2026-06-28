import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../context/ToastContext";
import { auth } from "../firebase/firebaseConfig";
import { User, Mail, Lock, Calendar, Eye, EyeOff, Check, X, ShieldAlert } from "lucide-react";

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

  // Sync state with user context on load
  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
    }
  }, [user]);

  // Format creation date
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

  // Password Strength Checker
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
    try {
      setNameLoading(true);
      await updateUserProfile(name);
      showToast("Display name updated successfully!", "success");
      setIsNameEditing(false);
    } catch (err) {
      showToast(err.message || "Failed to update name", "error");
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast("New email address is required", "error");
      return;
    }
    if (!emailPassword) {
      showToast("Current password is required to verify your identity", "error");
      return;
    }

    try {
      setEmailLoading(true);
      await updateUserEmail(emailPassword, newEmail);
      showToast("Verification email sent to your new address. Please verify it before logging in.", "success");
      setNewEmail("");
      setEmailPassword("");
    } catch (err) {
      showToast(err.message || "Failed to update email address", "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Current password is required", "error");
      return;
    }
    if (strength.score < 5) {
      showToast("New password does not meet the security requirements", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    if (currentPassword === newPassword) {
      showToast("New password cannot be the same as current password", "error");
      return;
    }

    try {
      setPasswordLoading(true);
      await updateUserPassword(currentPassword, newPassword);
      showToast("Password changed successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex-grow">
      {/* Title section */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-[var(--text-main)]">Profile Settings</h2>
        <p className="text-sm text-[var(--text-muted)] font-medium">Manage your TaskFlow account credentials and identity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative group mb-4">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                  style={{ backgroundColor: "#7C5CFC" }}
                >
                  {getInitials(user?.displayName || user?.email)}
                </div>
              )}
            </div>

            {/* User Meta info */}
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-0.5">
              {user?.displayName || "Workspace Member"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-medium mb-4 break-all max-w-full">
              {user?.email}
            </p>

            <div className="flex items-center gap-1.5 py-1 px-3 bg-slate-100 dark:bg-slate-800/60 rounded-full text-[10px] text-[var(--text-muted)] font-bold">
              <Calendar size={12} />
              <span>Joined {getCreationDate()}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card 1: Change Name */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-main)]">Profile Details</h4>
                <p className="text-[10px] text-[var(--text-muted)]">Your workspace display name</p>
              </div>
              {!isNameEditing && (
                <button
                  type="button"
                  onClick={() => setIsNameEditing(true)}
                  className="px-3 py-1.5 rounded-full border border-[var(--border-color)] hover:border-primary text-[10px] font-bold text-primary transition-all cursor-pointer bg-transparent"
                >
                  Edit Name
                </button>
              )}
            </div>

            {isNameEditing ? (
              <form onSubmit={handleUpdateName} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 pl-11 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-primary transition-all"
                      disabled={nameLoading}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setName(user?.displayName || "");
                      setIsNameEditing(false);
                    }}
                    className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer bg-transparent text-[var(--text-main)]"
                    disabled={nameLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-[#6344e3] text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer border-0"
                    disabled={nameLoading}
                  >
                    {nameLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4 py-1.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-[var(--border-color)]">
                  <User size={18} className="text-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block tracking-wider">Full Name</span>
                  <span className="text-xs font-semibold text-[var(--text-main)]">{user?.displayName || "Not set"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Change Email */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[var(--border-color)]">
              <h4 className="text-sm font-bold text-[var(--text-main)]">Change Email Address</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Requires verification link activation before becoming active</p>
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 pl-11 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-primary transition-all"
                      disabled={emailLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password confirmation to Re-Auth */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type={showEmailPass ? "text" : "password"}
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 pl-11 pr-11 text-xs text-[var(--text-main)] focus:outline-none focus:border-primary transition-all"
                      disabled={emailLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPass(!showEmailPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      {showEmailPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-[#6344e3] text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer border-0"
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Update Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Change Password */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-[var(--border-color)]">
              <h4 className="text-sm font-bold text-[var(--text-main)]">Change Password</h4>
              <p className="text-[10px] text-[var(--text-muted)]">Ensure your password contains strong security criteria</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Password */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type={showPass.current ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 pl-11 pr-11 text-xs text-[var(--text-main)] focus:outline-none focus:border-primary transition-all"
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      {showPass.current ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type={showPass.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 pl-11 pr-11 text-xs text-[var(--text-main)] focus:outline-none focus:border-primary transition-all"
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      {showPass.new ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 pl-11 pr-11 text-xs text-[var(--text-main)] focus:outline-none focus:border-primary transition-all"
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      {showPass.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-[var(--border-color)] p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Password Strength</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      strength.score <= 2 ? "text-rose-500" : strength.score <= 4 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {strength.score <= 2 ? "Weak" : strength.score <= 4 ? "Medium" : "Strong"}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`h-1.5 rounded-full transition-all ${
                          strength.score >= level 
                            ? strength.score <= 2 
                              ? "bg-rose-500" 
                              : strength.score <= 4 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements List */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-[var(--text-muted)] font-medium">
                    <div className="flex items-center gap-1.5">
                      {strength.checks.length ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {strength.checks.uppercase ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                      <span>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {strength.checks.lowercase ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                      <span>One lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {strength.checks.number ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                      <span>One number</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      {strength.checks.special ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                      <span>One special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-[#6344e3] text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer border-0"
                  disabled={passwordLoading || (newPassword && strength.score < 5)}
                >
                  {passwordLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Change Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfileSettings;
