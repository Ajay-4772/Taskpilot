import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { auth } from "../firebase/firebaseConfig";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { Lock, Eye, EyeOff, Mail, User, ArrowRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const Login = () => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const { showToast } = useToast();

  // Views: "login" | "signup" | "forgot" | "reset"
  const [view, setView] = useState("login");
  
  // Inputs
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Action Code for Reset Link
  const [oobCode, setOobCode] = useState("");
  
  // Form controllers
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef(null);

  // Map Firebase errors to human-friendly monochrome alerts
  const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
      case "auth/invalid-email":
        return "The email address is invalid.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No account exists with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "This email address is already registered.";
      case "auth/weak-password":
        return "The password is too weak. It must comply with password policy rules.";
      case "auth/too-many-requests":
        return "Too many requests. Access has been temporarily disabled.";
      case "auth/network-request-failed":
        return "Network connection failed. Check your internet connection.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completion.";
      default:
        return error.message || "An unexpected auth error occurred.";
    }
  };

  // Check URL parameters for Firebase reset redirect link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const code = params.get("oobCode");
    if (code && (mode === "resetPassword" || window.location.href.includes("resetPassword"))) {
      setView("reset");
      setOobCode(code);
    }
  }, []);

  // Autofocus input
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [view]);

  // Load remembered login
  useEffect(() => {
    const remembered = localStorage.getItem("taskpilot_remembered_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Password checker
  const checkPasswordStrength = (pass) => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };
    const score = Object.values(checks).filter(Boolean).length;
    
    let label = "Weak";
    if (score === 2) label = "Fair";
    if (score === 3) label = "Good";
    if (score === 4) label = "Strong";
    if (score === 5) label = "Excellent";

    return { checks, score, label };
  };

  const strength = checkPasswordStrength(password);

  const validateEmail = (emailVal) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailVal);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !validateEmail(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (view === "login") {
      if (!password) {
        showToast("Password is required.", "error");
        return;
      }
      
      setLoading(true);
      try {
        await loginWithEmail(email, password);
        showToast("Welcome back! Login successful.", "success");
        if (rememberMe) {
          localStorage.setItem("taskpilot_remembered_email", email);
        } else {
          localStorage.removeItem("taskpilot_remembered_email");
        }
      } catch (err) {
        showToast(getFirebaseErrorMessage(err), "error");
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
        showToast("Registration successful! Check your inbox for verification.", "success");
        setView("login");
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        showToast(getFirebaseErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim() || !validateEmail(email)) {
      showToast("Please enter your registered email address.", "error");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset link has been sent to your email.", "success");
      setView("login");
    } catch (err) {
      showToast(getFirebaseErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (strength.score < 5) {
      showToast("Password does not satisfy policy requirements.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      showToast("Password reset successfully! Proceed to login.", "success");
      setView("login");
      setPassword("");
      setConfirmPassword("");
      
      // Clean url parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      showToast(getFirebaseErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast("Google Login successful!", "success");
    } catch (err) {
      showToast(getFirebaseErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative font-sans text-zinc-900 select-none">
      
      {/* Centered logo branding */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center">
        <img 
          src={logo} 
          alt="TaskPilot Logo" 
          className="w-14 h-14 object-contain dark:invert" 
        />
        <h1 className="text-xl font-bold tracking-tight text-white mt-1">Welcome to TaskPilot</h1>
        <p className="text-[10px] text-zinc-400 font-medium">Manage your tasks smarter.</p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* CARD CONTAINER VIEW: LOGIN */}
        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm bg-white border border-zinc-200/90 rounded-[20px] p-8 shadow-2xl flex flex-col gap-6"
          >
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Welcome back</h2>
              <p className="text-xs text-zinc-500 mt-1">Sign in to continue managing your projects.</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-[10px] font-bold text-zinc-500 hover:text-black transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 bg-zinc-50 text-black focus:ring-black focus:ring-offset-0"
                />
                <span>Remember Me</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-black hover:bg-zinc-800 transition-all cursor-pointer border-0 mt-1"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center">
              <hr className="flex-grow border-zinc-200" />
              <span className="px-3 text-[9px] font-bold uppercase tracking-wider text-zinc-400">or</span>
              <hr className="flex-grow border-zinc-200" />
            </div>

            {/* Google provider sign in */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-zinc-200 bg-transparent text-zinc-900 text-xs font-bold hover:bg-zinc-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center text-xs">
              <span className="text-zinc-500 font-semibold">New to TaskPilot? </span>
              <button
                onClick={() => setView("signup")}
                className="text-black font-bold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Create workspace
              </button>
            </div>
          </motion.div>
        )}

        {/* CARD CONTAINER VIEW: SIGN UP */}
        {view === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm bg-white border border-zinc-200/90 rounded-[20px] p-8 shadow-2xl flex flex-col gap-6"
          >
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Create workspace</h2>
              <p className="text-xs text-zinc-500 mt-1">Get started with your project checklist.</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Real-time Checklist & Strength Meter */}
              {password && (
                <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>Password Strength</span>
                    <span className={`font-bold ${
                      strength.score <= 2 ? "text-red-500" : strength.score <= 4 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {strength.label}
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
                            : "bg-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-zinc-500 font-medium">
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
                      <span>One number</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      {strength.checks.special ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-500 shrink-0" />}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || strength.score < 5}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-black hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border-0 mt-1"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Register workspace</span>
                )}
              </button>
            </form>

            <div className="text-center text-xs">
              <span className="text-zinc-500 font-semibold">Already have an account? </span>
              <button
                onClick={() => setView("login")}
                className="text-black font-bold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}

        {/* CARD CONTAINER VIEW: FORGOT PASSWORD */}
        {view === "forgot" && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm bg-white border border-zinc-200/90 rounded-[20px] p-8 shadow-2xl flex flex-col gap-6"
          >
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Forgot Password</h2>
              <p className="text-xs text-zinc-500 mt-1">Enter your email and we'll send a password recovery link.</p>
            </div>

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-black hover:bg-zinc-800 transition-all cursor-pointer border-0 mt-1"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send reset email</span>
                )}
              </button>
            </form>

            <div className="text-center text-xs">
              <button
                onClick={() => setView("login")}
                className="text-black font-bold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </motion.div>
        )}

        {/* CARD CONTAINER VIEW: RESET PASSWORD */}
        {view === "reset" && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm bg-white border border-zinc-200/90 rounded-[20px] p-8 shadow-2xl flex flex-col gap-6"
          >
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Set New Password</h2>
              <p className="text-xs text-zinc-500 mt-1">Submit a secure password for your workspace account.</p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password Strength checklist */}
              {password && (
                <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>Password Strength</span>
                    <span className={`font-bold ${
                      strength.score <= 2 ? "text-red-500" : strength.score <= 4 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {strength.label}
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
                            : "bg-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-zinc-500 font-medium">
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
                      <span>One number</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      {strength.checks.special ? <Check size={10} className="text-emerald-500 shrink-0" /> : <X size={10} className="text-red-500 shrink-0" />}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors border-0 bg-transparent cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || strength.score < 5}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-xs bg-black hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer border-0 mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Monochrome B&W copyright */}
      <div className="absolute bottom-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest select-none">
        TaskPilot © 2026
      </div>
    </div>
  );
};

export default Login;
