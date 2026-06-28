import React from "react";
import { useAuth } from "../auth/AuthContext";
import Login from "../pages/Login";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-main text-[var(--text-main)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7C5CFC] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider text-[var(--text-muted)] animate-pulse uppercase">
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
