import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Sun, Moon, LogOut, Plus, LayoutDashboard, User } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = ({ darkMode, onToggleTheme, onAddTaskClick, activeTab, onTabChange, onLogoutClick }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "#6366f1";
    const colors = [
      "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
      "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <nav className="sticky top-0 z-50 h-[70px] glass-navbar flex items-center shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Left Side: Logo & Brand */}
        <div 
          className="flex items-center gap-2 shrink-0 cursor-pointer"
          onClick={() => onTabChange("dashboard")}
        >
          <img 
            src={logo} 
            alt="TaskPilot Logo" 
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain dark:invert shrink-0" 
          />
          <span className="text-sm sm:text-lg font-bold tracking-tight text-[var(--text-main)] hidden min-[400px]:block">
            TaskFlow
          </span>
        </div>

        {/* Center: Navigation Pills */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            type="button"
            className={`nav-link-custom px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
              activeTab === "dashboard" ? "active" : ""
            }`}
            onClick={() => onTabChange("dashboard")}
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          
          <button 
            type="button"
            className={`nav-link-custom px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => onTabChange("profile")}
          >
            <User size={14} />
            <span className="hidden sm:inline">Profile</span>
          </button>

          <button 
            type="button"
            className="nav-link-custom px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
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

          {/* User Initial Avatar / Link to Profile */}
          <button 
            type="button"
            onClick={() => onTabChange("profile")}
            className="flex items-center cursor-pointer border-0 bg-transparent p-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
            title="Profile Settings"
          >
            <div 
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-md transition-all ${
                activeTab === "profile" ? "ring-2 ring-primary/45 scale-105" : ""
              }`}
              style={{ backgroundColor: getAvatarColor(user?.displayName || user?.email) }}
            >
              {getInitials(user?.displayName || user?.email)}
            </div>
          </button>

          {/* Logout Action */}
          <button 
            type="button"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-red-500 transition-colors border-0 bg-transparent p-0 cursor-pointer ml-1"
            onClick={onLogoutClick}
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
