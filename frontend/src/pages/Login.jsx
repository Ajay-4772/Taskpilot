import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../context/ToastContext";
import { auth } from "../firebase/firebaseConfig";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { CheckSquare, Lock, Eye, EyeOff, Mail, User, ArrowRight, Check, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const { showToast } = useToast();

  // Auth Views: "login" | "signup" | "forgot" | "reset"
  const [view, setView] = useState("login");
  
  // Input fields
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Reset Password Action Code from Firebase Link
  const [oobCode, setOobCode] = useState("");
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Field validation states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const emailInputRef = useRef(null);

  // Parse Firebase authentication callback links (for Forgot Password reset emails)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const code = params.get("oobCode");
    if (code && (mode === "resetPassword" || window.location.href.includes("resetPassword"))) {
      setView("reset");
      setOobCode(code);
    }
  }, []);

  // Autofocus first input on view change
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [view]);

  // Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem("taskflow_remembered_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

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

  const strength = checkPasswordStrength(password);

  // Email format validator
  const validateEmail = (emailVal) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailVal);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    // Validate email
    if (!email.trim() || !validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (view === "login") {
      if (!password) {
        setPasswordError("Password is required.");
        return;
      }
      
      setLoading(true);
      try {
        await loginWithEmail(email, password);
        showToast("Logged in successfully. Welcome to TaskFlow!", "success");
        if (rememberMe) {
          localStorage.setItem("taskflow_remembered_email", email);
        } else {
          localStorage.removeItem("taskflow_remembered_email");
        }
      } catch (err) {
        showToast(err.message || "Failed to log in. Please check your credentials.", "error");
      } finally {
        setLoading(false);
      }
    } else if (view === "signup") {
      if (!displayName.trim()) {
        showToast("Full Name is required.", "error");
        return;
      }
      if (strength.score < 5) {
        showToast("Please satisfy all password security requirements.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      setLoading(true);
      try {
        await signupWithEmail(email, password, displayName);
        showToast("Account created successfully! Welcome to TaskFlow.", "success");
        setView("login");
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        showToast(err.message || "Sign up failed. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim() || !validateEmail(email)) {
      setEmailError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset link has been sent to your email address.", "success");
      setView("login");
    } catch (err) {
      showToast(err.message || "Failed to send reset link.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (strength.score < 5) {
      showToast("Password is not strong enough.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      showToast("Password has been reset successfully! You can now log in.", "success");
      setView("login");
      setPassword("");
      setConfirmPassword("");
      
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      showToast(err.message || "Failed to reset password. Link may be expired.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast("Logged in with Google successfully!", "success");
    } catch (err) {
      showToast(err.message || "Google Authentication failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#030712] text-[#f8fafc] overflow-hidden select-none">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 50, 0],
            y: [0, 60, -20, 0],
            scale: [1, 0.95, 1.15, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Main Authentication Card Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex w-full max-w-[950px] bg-[#0b0f19]/80 backdrop-blur-lg border border-slate-800/80 rounded-[32px] overflow-hidden shadow-2xl min-h-[600px] flex-col md:flex-row"
      >
        
        {/* Left Side: SaaS Brand and Features Panel (Visible on Desktop) */}
        <div 
          className="w-full md:w-1/2 p-12 text-white flex flex-col justify-between relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #7C5CFC 0%, #4338ca 100%)"
          }}
        >
          {/* Top Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl w-12 h-12 shadow-lg border border-white/20">
              <CheckSquare size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TaskFlow</span>
          </div>

          {/* SaaS Copy */}
          <div className="my-8 space-y-6">
            <h2 className="text-3xl font-extrabold leading-tight">
              Manage your workspace. <br />
              <span className="text-indigo-200">Track task progress.</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              TaskFlow is a premium task management portal for teams. Set dates, organize priority states, and analyze task statistics in real-time.
            </p>

            {/* Premium feature indicators */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/20">
                  ✓
                </div>
                <span className="text-xs font-semibold text-white/90">User-Isolated Task Data Flow</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/20">
                  ✓
                </div>
                <span className="text-xs font-semibold text-white/90">Interactive Stats Cards & Filters</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold border border-white/20">
                  ✓
                </div>
                <span className="text-xs font-semibold text-white/90">Instant Light & Dark Theme Swapper</span>
              </div>
            </div>
          </div>

          {/* Footer copyright */}
          <div className="text-[10px] text-white/50 font-bold tracking-wider">
            © 2026 TaskFlow. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form Views Pane */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-slate-950/40 relative">
          
          <AnimatePresence mode="wait">
            
            {/* VIEW A: SIGN IN */}
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">Welcome back</h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Sign in to continue managing your projects.</p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`w-full bg-[var(--input-bg)] border rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all ${
                          emailError ? "border-rose-500" : "border-slate-800"
                        }`}
                        disabled={loading}
                        required
                      />
                    </div>
                    {emailError && <span className="text-[10px] font-bold text-rose-500">{emailError}</span>}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-[10px] font-bold text-primary hover:text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full bg-[var(--input-bg)] border rounded-xl py-2.5 pl-11 pr-11 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all ${
                          passwordError ? "border-rose-500" : "border-slate-800"
                        }`}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {passwordError && <span className="text-[10px] font-bold text-rose-500">{passwordError}</span>}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-800 bg-[var(--input-bg)] text-primary focus:ring-primary/20 focus:ring-offset-0"
                      />
                      <span>Remember Me</span>
                    </label>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-primary hover:bg-[#6344e3] active:scale-[0.98] transition-all shadow-md shadow-primary/25 cursor-pointer border-0 mt-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Third Party Social Sign in */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <hr className="flex-grow border-slate-800/80" />
                    <span className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-500">or continue with</span>
                    <hr className="flex-grow border-slate-800/80" />
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-slate-800 bg-transparent text-white text-xs font-semibold hover:bg-slate-900 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Sign In with Google</span>
                  </button>
                </div>

                {/* Footer switcher */}
                <div className="text-center text-xs font-medium">
                  <span className="text-[var(--text-muted)]">Don't have an account? </span>
                  <button
                    onClick={() => setView("signup")}
                    className="text-primary font-bold hover:text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW B: SIGN UP */}
            {view === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">Create Account</h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Create your TaskFlow workspace.</p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        ref={emailInputRef}
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[var(--input-bg)] border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[var(--input-bg)] border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--input-bg)] border border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Widget */}
                  {password && (
                    <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        <span>Password Strength</span>
                        <span className={strength.score <= 2 ? "text-rose-500" : strength.score <= 4 ? "text-amber-500" : "text-emerald-500"}>
                          {strength.score <= 2 ? "Weak" : strength.score <= 4 ? "Medium" : "Strong"}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level} 
                            className={`h-1 rounded-full transition-all ${
                              strength.score >= level 
                                ? strength.score <= 2 
                                  ? "bg-rose-500" 
                                  : strength.score <= 4 
                                  ? "bg-amber-500" 
                                  : "bg-emerald-500"
                                : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-[var(--text-muted)] font-medium">
                        <div className="flex items-center gap-1">
                          {strength.checks.length ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>Min 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strength.checks.uppercase ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One uppercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strength.checks.lowercase ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One lowercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strength.checks.number ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One digit</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          {strength.checks.special ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One special character</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--input-bg)] border border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading || strength.score < 5}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-primary hover:bg-[#6344e3] active:scale-[0.98] transition-all shadow-md shadow-primary/25 cursor-pointer border-0 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Workspace</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer switcher */}
                <div className="text-center text-xs font-medium">
                  <span className="text-[var(--text-muted)]">Already have an account? </span>
                  <button
                    onClick={() => setView("login")}
                    className="text-primary font-bold hover:text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW C: FORGOT PASSWORD */}
            {view === "forgot" && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">Reset Password</h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Enter your email and we'll send you a recovery link.</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`w-full bg-[var(--input-bg)] border rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all ${
                          emailError ? "border-rose-500" : "border-slate-800"
                        }`}
                        disabled={loading}
                        required
                      />
                    </div>
                    {emailError && <span className="text-[10px] font-bold text-rose-500">{emailError}</span>}
                  </div>

                  {/* Action button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-primary hover:bg-[#6344e3] active:scale-[0.98] transition-all shadow-md shadow-primary/25 cursor-pointer border-0 mt-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Send Recovery Link</span>
                    )}
                  </button>
                </form>

                {/* Footer switcher */}
                <div className="text-center text-xs font-semibold">
                  <button
                    onClick={() => setView("login")}
                    className="text-primary font-bold hover:text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* VIEW D: RESET PASSWORD (FROM EMAIL LINK) */}
            {view === "reset" && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">Enter New Password</h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Please supply a secure, new password for your workspace.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--input-bg)] border border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Widget */}
                  {password && (
                    <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        <span>Password Strength</span>
                        <span className={strength.score <= 2 ? "text-rose-500" : strength.score <= 4 ? "text-amber-500" : "text-emerald-500"}>
                          {strength.score <= 2 ? "Weak" : strength.score <= 4 ? "Medium" : "Strong"}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level} 
                            className={`h-1 rounded-full transition-all ${
                              strength.score >= level 
                                ? strength.score <= 2 
                                  ? "bg-rose-500" 
                                  : strength.score <= 4 
                                  ? "bg-amber-500" 
                                  : "bg-emerald-500"
                                : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-[var(--text-muted)] font-medium">
                        <div className="flex items-center gap-1">
                          {strength.checks.length ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>Min 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strength.checks.uppercase ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One uppercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strength.checks.lowercase ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One lowercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strength.checks.number ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One digit</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          {strength.checks.special ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-rose-500" />}
                          <span>One special character</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--input-bg)] border border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-all"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    type="submit"
                    disabled={loading || strength.score < 5}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-primary hover:bg-[#6344e3] active:scale-[0.98] transition-all shadow-md shadow-primary/25 cursor-pointer border-0 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Save Password</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </motion.div>
    </div>
  );
};

export default Login;
