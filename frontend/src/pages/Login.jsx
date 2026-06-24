import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { CheckSquare, Lock, Eye, EyeOff, Mail, User, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const Login = () => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrUsername.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please enter your Email Address",
        confirmButtonColor: "#7C5CFC"
      });
      return;
    }

    if (password.length < 4) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text: "Password must be at least 4 characters long",
        confirmButtonColor: "#7C5CFC"
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signupWithEmail(emailOrUsername, password, displayName);
        Swal.fire({
          icon: "success",
          title: "Account Created",
          text: "Welcome to TaskPilot!",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await loginWithEmail(emailOrUsername, password);
        Swal.fire({
          icon: "success",
          title: "Login Success",
          text: "Welcome back!",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Authentication Failed",
        text: error.message || "Invalid credentials. Please try again.",
        confirmButtonColor: "#7C5CFC"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      Swal.fire({
        icon: "success",
        title: "Google Login Success",
        text: "Welcome to TaskPilot!",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Google Authentication Failed",
        text: error.message || "Could not log in with Google.",
        confirmButtonColor: "#7C5CFC"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020617] p-4">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col md:flex-row w-full max-w-[900px] min-h-[520px] bg-[#0F172A] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#1e293b]"
      >
        {/* Left Side: Gradient Branding Pane */}
        <div className="w-full md:w-5/12 flex flex-col justify-between p-10 text-white relative" style={{
          background: "linear-gradient(135deg, #7C5CFC 0%, #A78BFA 100%)"
        }}>
          <div>
            {/* Logo */}
            <div className="flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl mb-8 w-14 h-14 shadow-lg border border-white/25">
              <CheckSquare size={30} className="text-white" />
            </div>
            {/* Title */}
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">TaskPilot</h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Manage your projects with clarity and precision
            </p>
          </div>

          {/* Checklist */}
          <div className="flex flex-col gap-4 my-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 text-xs font-bold border border-white/25">
                ✓
              </div>
              <span className="text-sm font-medium text-white/90">Create & organize tasks</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 text-xs font-bold border border-white/25">
                ✓
              </div>
              <span className="text-sm font-medium text-white/90">Track progress in real-time</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-white/20 rounded-full w-6 h-6 text-xs font-bold border border-white/25">
                ✓
              </div>
              <span className="text-sm font-medium text-white/90">Beautiful dark & light themes</span>
            </div>
          </div>

          <div className="text-xs text-white/50 font-medium">
            TaskPilot © 2026
          </div>
        </div>

        {/* Right Side: Form Pane */}
        <div className="w-full md:w-7/12 flex flex-col justify-center p-8 md:p-12 bg-[#0F172A] text-[#f8fafc]">
          <div className="mb-6">
            <h3 className="text-2xl font-bold tracking-tight mb-1 text-white">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h3>
            <p className="text-[#94a3b8] text-sm">
              {isSignUp ? "Sign up to start organizing your project tasks" : "Sign in to your account to continue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Display Name */}
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#94a3b8]">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94a3b8]">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <input
                  type="email"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94a3b8]">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-xl py-2.5 pl-11 pr-11 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full mt-2 py-3 rounded-xl text-white font-semibold text-sm bg-[#7C5CFC] hover:bg-[#6344e3] active:scale-[0.98] transition-all shadow-md shadow-[#7C5CFC]/25 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center my-2">
              <hr className="flex-grow border-[#334155]" />
              <span className="px-3 text-[10px] uppercase tracking-wider text-[#64748b]">or continue with</span>
              <hr className="flex-grow border-[#334155]" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-[#334155] bg-transparent text-white text-sm font-medium hover:bg-[#1e293b] active:scale-[0.98] transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>

          {/* Toggle Login/Signup */}
          <div className="text-center mt-6 text-sm">
            <span className="text-[#94a3b8]">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#7C5CFC] font-semibold hover:text-[#a58cfc] hover:underline bg-transparent border-0 cursor-pointer"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
