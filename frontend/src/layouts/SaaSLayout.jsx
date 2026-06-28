import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, User, Sun, Moon, LogOut, Menu, X, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SaaSLayout = ({ children, activeTab, onTabChange, onLogoutClick, darkMode, onToggleTheme }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile Settings", icon: User }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900 text-zinc-50 select-none">
      {/* Sidebar Header Logo */}
      <div className="h-[70px] px-6 border-b border-zinc-900 flex items-center gap-3">
        <div className="flex items-center justify-center bg-white text-black rounded-lg w-8 h-8 font-bold">
          <CheckSquare size={16} />
        </div>
        <span className="text-base font-bold tracking-tight text-white">TaskFlow</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-grow py-6 px-4 space-y-1">
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
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                isActive 
                  ? "bg-white text-black" 
                  : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-zinc-900 space-y-4">
        {/* User initials info card */}
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(user.displayName || user.email)}
            </div>
            <div className="min-w-0 flex-grow">
              <p className="text-xs font-bold text-white truncate leading-none mb-1">
                {user.displayName || "Workspace Member"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate leading-none">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          {/* Sun/Moon Theme switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-transparent text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Logout Action */}
          <button
            type="button"
            onClick={onLogoutClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 hover:border-red-900 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 transition-all cursor-pointer bg-transparent text-xs font-semibold"
          >
            <LogOut size={14} />
            <span>Logout</span>
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

      {/* Desktop sidebar wrapper */}
      <aside className="hidden md:block w-[240px] shrink-0 sticky top-0 h-screen z-40">
        <SidebarContent />
      </aside>

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
      <main className="flex-grow flex flex-col min-w-0 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default SaaSLayout;
