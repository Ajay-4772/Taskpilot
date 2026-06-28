import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Inbox } from "lucide-react";
import { getTasks, addTask, updateTask, deleteTask } from "../services/taskService";
import TaskCard from "../components/TaskCard";
import TaskFormModal from "../components/TaskFormModal";
import ErrorState from "../components/common/ErrorState";
import { StatsCardSkeleton, TaskCardSkeleton } from "../components/skeletons/SkeletonLoaders";
import { useToast } from "../context/ToastContext";
import Swal from "sweetalert2";

const Dashboard = ({ refreshTrigger, onAddTaskTrigger, setOnAddTaskTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const { showToast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTasks();
      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        throw new Error("Invalid response format received from backend.");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      if (!err.response) {
        setError({
          type: "server",
          message: "Unable to connect to the server. Please check if the backend is running and try again."
        });
      } else {
        setError({
          type: "database",
          message: err.response?.data?.message || "Failed to load tasks from the database."
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  useEffect(() => {
    if (onAddTaskTrigger) {
      handleOpenCreateModal();
      setOnAddTaskTrigger(false);
    }
  }, [onAddTaskTrigger, setOnAddTaskTrigger]);

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = useCallback((task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, []);

  const handleSaveTask = async (taskData) => {
    try {
      if (taskToEdit) {
        // Optimistic UI update: find task and update locally first
        const oldTasks = [...tasks];
        setTasks(prev => prev.map(t => t._id === taskToEdit._id ? { ...t, ...taskData } : t));
        
        try {
          await updateTask(taskToEdit._id, taskData);
          showToast("Task updated successfully!", "success");
        } catch (err) {
          setTasks(oldTasks); // Rollback on failure
          throw err;
        }
      } else {
        await addTask(taskData);
        showToast("Task created successfully!", "success");
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
      showToast(err.response?.data?.message || "Failed to save task.", "error");
    }
  };

  const handleCompleteTask = useCallback(async (id) => {
    // Optimistic status update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: "Completed" } : t));
    showToast("Task completed!", "success");

    try {
      const task = tasks.find(t => t._id === id);
      if (task) {
        await updateTask(id, { ...task, status: "Completed" });
        fetchTasks();
      }
    } catch (err) {
      console.error("Error completing task:", err);
      showToast("Failed to update status. Rolling back.", "error");
      fetchTasks(); // Reload correct state
    }
  }, [tasks, fetchTasks, showToast]);

  const handleDeleteTask = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "var(--bg-card)",
      color: "var(--text-main)"
    });

    if (result.isConfirmed) {
      // Optimistic delete
      const oldTasks = [...tasks];
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast("Task deleted.", "info");

      try {
        await deleteTask(id);
        fetchTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
        setTasks(oldTasks); // Rollback
        showToast("Failed to delete task.", "error");
      }
    }
  }, [tasks, fetchTasks, showToast]);

  // Statistics memoization
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "Pending").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  // Filtering memoization
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === "All") return matchesSearch;
      return matchesSearch && task.status === activeFilter;
    });
  }, [tasks, searchQuery, activeFilter]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-7xl mx-auto px-6 py-8 flex-grow"
    >
      {/* Title section */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-[var(--text-main)]">Dashboard</h2>
        <p className="text-sm text-[var(--text-muted)] font-medium">Manage and track all your project tasks</p>
      </div>

      {/* Analytics Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading && tasks.length === 0 ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Tasks Card */}
            <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-extrabold mb-2 text-[#7C5CFC] group-hover:scale-105 transition-transform origin-left">
                {stats.total}
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Total Tasks
              </div>
            </div>

            {/* Pending Card */}
            <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-extrabold mb-2 text-[var(--text-muted)] group-hover:scale-105 transition-transform origin-left">
                {stats.pending}
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Pending
              </div>
            </div>

            {/* In Progress Card */}
            <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-extrabold mb-2 text-[#f59e0b] group-hover:scale-105 transition-transform origin-left">
                {stats.inProgress}
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                In Progress
              </div>
            </div>

            {/* Completed Card */}
            <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-extrabold mb-2 text-[#10b981] group-hover:scale-105 transition-transform origin-left">
                {stats.completed}
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Completed
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        {/* Search Input Bar */}
        <div className="relative flex-grow max-w-[450px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full py-2.5 pl-11 pr-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-primary transition-all"
          />
        </div>
        
        {/* New Task Trigger Button */}
        <button 
          onClick={handleOpenCreateModal}
          className="btn-saas-primary justify-center rounded-full cursor-pointer"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Status pills filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["All", "Pending", "In Progress", "Completed"].map((filter) => {
          const count = 
            filter === "All" ? stats.total :
            filter === "Pending" ? stats.pending :
            filter === "In Progress" ? stats.inProgress : stats.completed;
          return (
            <button 
              key={filter}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeFilter === filter 
                  ? "bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/25" 
                  : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary hover:text-primary"
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter} ({count})
            </button>
          );
        })}
      </div>

      {/* Task Cards Workspace */}
      {error ? (
        <ErrorState 
          type={error.type} 
          message={error.message} 
          onRetry={fetchTasks} 
        />
      ) : loading && tasks.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : (
        <div>
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] text-center py-16 flex flex-col items-center justify-center min-h-[300px] shadow-sm"
            >
              <Inbox size={44} className="mb-4 text-[var(--text-muted)] animate-bounce-slow" />
              <h5 className="text-base font-bold text-[var(--text-main)] mb-1">No Tasks Yet</h5>
              <p className="text-xs text-[var(--text-muted)] max-w-xs leading-normal">
                {searchQuery ? "No matching tasks found. Try resetting your search query or status filter." : "Create your first task to get started."}
              </p>
              {!searchQuery && (
                <button 
                  onClick={handleOpenCreateModal} 
                  className="btn-saas-secondary mt-5 py-2 px-5 text-xs cursor-pointer rounded-full"
                >
                  <Plus size={14} className="mr-1" /> Create Task
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={task._id} 
                  >
                    <TaskCard 
                      task={task}
                      onComplete={handleCompleteTask}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTask}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* Task form modal overlay */}
      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </motion.div>
  );
};

export default Dashboard;