import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [addTaskTrigger, setAddTaskTrigger] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // Initialize theme from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("taskpilot_theme");
    return savedTheme === "dark";
  });

  // Apply theme to document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("taskpilot_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("taskpilot_theme", "light");
    }
  }, [darkMode]);

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
          onAddTaskClick={() => setAddTaskTrigger(true)}
        />

        {/* Dashboard Content */}
        <Dashboard 
          refreshTrigger={refreshTrigger}
          onAddTaskTrigger={addTaskTrigger}
          setOnAddTaskTrigger={setAddTaskTrigger}
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
          TaskPilot © 2026
        </footer>
      </div>
    </ProtectedRoute>
  );
}

export default App;