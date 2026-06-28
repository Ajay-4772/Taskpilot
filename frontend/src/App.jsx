import React, { useState, useEffect, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LogoutModal from "./components/common/LogoutModal";
import { useAuth } from "./auth/AuthContext";
import { useToast } from "./context/ToastContext";
import { TaskCardSkeleton, ProfileSkeleton } from "./components/skeletons/SkeletonLoaders";

// Lazy-load page components for performance optimization
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));

function App() {
  const [addTaskTrigger, setAddTaskTrigger] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "profile"
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { logout } = useAuth();
  const { showToast } = useToast();

  // Initialize theme from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("taskflow_theme");
    return savedTheme === "dark";
  });

  // Apply theme to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("taskflow_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("taskflow_theme", "light");
    }
  }, [darkMode]);

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    try {
      await logout();
      showToast("Logout successful! See you again soon.", "success");
    } catch (err) {
      showToast("Logout failed. Please try again.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-theme-main flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C5CFC]/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#A78BFA]/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Navigation Bar */}
        <Navbar 
          darkMode={darkMode} 
          onToggleTheme={() => setDarkMode(!darkMode)}
          onAddTaskClick={() => {
            setActiveTab("dashboard");
            setAddTaskTrigger(true);
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />

        {/* Dashboard Content inside Suspense fallback for premium lazy loading */}
        <Suspense fallback={
          <div className="w-full max-w-7xl mx-auto px-6 py-8 flex-grow">
            {activeTab === "dashboard" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </div>
            ) : (
              <ProfileSkeleton />
            )}
          </div>
        }>
          {activeTab === "dashboard" ? (
            <Dashboard 
              refreshTrigger={refreshTrigger}
              onAddTaskTrigger={addTaskTrigger}
              setOnAddTaskTrigger={setAddTaskTrigger}
            />
          ) : (
            <ProfileSettings />
          )}
        </Suspense>

        {/* Custom Logout Modal */}
        <LogoutModal 
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogoutConfirm}
        />

        {/* Footer */}
        <footer 
          className="text-center py-6 border-t mt-auto relative z-10" 
          style={{
            borderColor: "var(--border-color) !important",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-muted)",
            fontSize: "0.8rem"
          }}
        >
          TaskFlow © 2026
        </footer>
      </div>
    </ProtectedRoute>
  );
}

export default App;