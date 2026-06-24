import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Sun, Moon, LogOut, CheckSquare, Plus, LayoutDashboard } from "lucide-react";

const Navbar = ({ darkMode, onToggleTheme, onAddTaskClick }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 h-[70px] glass-navbar flex items-center shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Left Side: Logo & Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center bg-primary text-white rounded-xl shadow-md shadow-primary/20 w-8 h-8 sm:w-9 sm:h-9">
            <CheckSquare size={16} />
          </div>
          <span className="text-sm sm:text-lg font-bold tracking-tight text-[var(--text-main)] hidden min-[400px]:block">
            TaskPilot
          </span>
        </div>

        {/* Center: Navigation Pills */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="nav-link-custom active px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold">
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button 
            className="nav-link-custom px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold"
            onClick={onAddTaskClick}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Right Side: Theme switch, Avatar, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Theme Toggler */}
          <button 
            onClick={onToggleTheme} 
            className="flex items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-main)] hover:scale-105 transition-transform w-8 h-8 sm:w-9 sm:h-9 cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun size={15} className="text-warning animate-pulse" />
            ) : (
              <Moon size={15} className="text-primary" />
            )}
          </button>

          {/* User Initial Avatar */}
          <div className="flex items-center">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[var(--border-color)] shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-md shadow-primary/20"
                style={{ backgroundColor: "#7C5CFC" }}
              >
                {getInitials(user?.displayName || user?.email)}
              </div>
            )}
          </div>

          {/* Logout Action */}
          <button 
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors border-0 bg-transparent p-0 cursor-pointer ml-1"
            onClick={logout}
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
