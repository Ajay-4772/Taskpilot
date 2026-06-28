import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "../pages/Login";
import ErrorState from "./common/ErrorState";
import logo from "../assets/logo.png";

const ProtectedRoute = ({ children }) => {
  const { user, loading, authError, retrySync } = useAuth();

  // If backend sync failed/timed out, show connection ErrorState
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-6 select-none">
        <ErrorState 
          type="server" 
          message={authError.message} 
          onRetry={retrySync} 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] select-none">
        <div className="flex flex-col items-center gap-4">
          <img 
            src={logo} 
            alt="TaskPilot Logo" 
            className="w-20 h-20 object-contain animate-pulse dark:invert" 
          />
          <span className="text-[9px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
            Initializing TaskPilot...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;
