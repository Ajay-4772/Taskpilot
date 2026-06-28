import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "../pages/Login";
import ErrorState from "./common/ErrorState";

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] animate-pulse uppercase">
            Initializing TaskFlow...
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
