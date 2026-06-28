import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, User, Sun, Moon, LogOut, Menu, X, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SaaSLayout = ({ children, activeTab, onTabChange, onLogoutClick, darkMode, onToggleTheme }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize sidebar collapsed state (mobile/tablet start collapsed automatically)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (window.innerWidth < 768) return true;
    const saved = localStorage.getItem("taskflow_sidebar_collapsed");
    return saved === "true";
  });

  // Persist sidebar collapsed status
  useEffect(() => {
    localStorage.setItem("taskflow_sidebar_collapsed", isCollapsed);
  }, [isCollapsed]);

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

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile Settings", icon: User }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900 text-zinc-50 select-none relative">
      {/* Sidebar Header Logo & Collapse/Expand Button */}
      <div className={`h-[70px] px-5 border-b border-zinc-900 flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
        <button 
          type="button" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-400 hover:text-white p-1.5 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu size={18} />
        </button>
        {!isCollapsed && (
          <span className="text-base font-bold tracking-tight text-white select-none">TaskFlow</span>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-grow py-6 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`flex items-center ${isCollapsed ? "justify-center px-0" : "px-4"} gap-3 w-full py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                isActive 
                  ? "bg-white text-black font-bold" 
                  : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon size={16} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-zinc-900 flex flex-col gap-4 items-center">
        {/* User initials info card */}
        {user && (
          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3 px-2 w-full"}`}>
            <div 
              className="w-8 h-8 rounded-full border border-zinc-700/60 dark:border-zinc-800 flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 overflow-hidden select-none"
              style={{ backgroundColor: getAvatarColor(user.displayName || user.email) }}
            >
              {getInitials(user.displayName || user.email)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-grow">
                <p className="text-xs font-bold text-white truncate leading-none mb-1">
                  {user.displayName || "Workspace Member"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate leading-none">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={`flex ${isCollapsed ? "flex-col items-center gap-3 w-full" : "items-center justify-between gap-2 w-full"} pt-2`}>
          {/* Sun/Moon Theme switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-transparent text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Logout Action */}
          <button
            type="button"
            onClick={onLogoutClick}
            className={`flex items-center justify-center ${isCollapsed ? "p-2 rounded-lg" : "px-3 py-2 rounded-lg"} border border-zinc-800 hover:border-red-950 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 transition-all cursor-pointer bg-transparent text-xs font-semibold shrink-0`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut size={14} className="shrink-0" />
            {!isCollapsed && <span className="ml-1.5">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-main)] text-[var(--text-main)] relative">
      
      {/* Mobile Menu Header */}
      <header className="h-[60px] border-b border-[var(--border-color)] bg-[var(--bg-card)] px-6 flex md:hidden items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center bg-zinc-950 dark:bg-white text-white dark:text-black rounded-lg w-7 h-7 font-bold">
            <CheckSquare size={14} />
          </div>
          <span className="text-sm font-bold text-[var(--text-main)]">TaskFlow</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 text-[var(--text-main)] border-0 bg-transparent cursor-pointer flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Desktop sidebar wrapper with spring transitions */}
      <motion.aside 
        animate={{ width: isCollapsed ? 70 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:block shrink-0 sticky top-0 h-screen z-40 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Screen darkener */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Menu container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-[240px] h-full z-10"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right panel layout content */}
      <main className="flex-grow flex flex-col min-w-0 relative z-10 transition-all duration-350">
        {children}
      </main>
    </div>
  );
};

export default SaaSLayout;
