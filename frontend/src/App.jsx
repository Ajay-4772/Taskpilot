import React, { useState, useEffect, Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import SaaSLayout from "./layouts/SaaSLayout";
import ConfirmModal from "./components/common/ConfirmModal";
import { useAuth } from "./contexts/AuthContext";
import { useToast } from "./contexts/ToastContext";
import { TaskCardSkeleton, ProfileSkeleton } from "./components/skeletons/SkeletonLoaders";

// Lazy-load page components for performance optimization
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));

function App() {
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [addTaskTrigger, setAddTaskTrigger] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "profile"
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Initialize theme from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("taskflow_theme");
    return savedTheme === "dark";
  });

  // Apply theme to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("taskflow_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
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
      <SaaSLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      >
        <div className="flex flex-col min-h-screen relative overflow-x-hidden">
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

          {/* Custom Logout Confirm Modal */}
          <ConfirmModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleLogoutConfirm}
            title="Confirm Sign Out"
            message="Are you sure you want to log out of your TaskFlow workspace?"
            type="logout"
            confirmText="Log Out"
          />
        </div>
      </SaaSLayout>
    </ProtectedRoute>
  );
}

export default App;