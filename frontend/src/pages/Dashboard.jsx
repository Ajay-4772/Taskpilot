import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getTasks, addTask, updateTask, deleteTask } from "../services/taskService";
import TaskCard from "../components/TaskCard";
import TaskFormModal from "../components/TaskFormModal";
import ConfirmModal from "../components/common/ConfirmModal";
import ErrorState from "../components/common/ErrorState";
import { StatsCardSkeleton, TaskCardSkeleton } from "../components/skeletons/SkeletonLoaders";
import { Search, Plus, Inbox, ArrowUpDown, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = ({ refreshTrigger, onAddTaskTrigger, setOnAddTaskTrigger }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "alphabetical"

  // Modals & Confirmation Trigger
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    confirmText: "Confirm",
    onConfirm: () => {}
  });

  const fetchTasks = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError({
        type: "server",
        message: "Failed to connect to database. Please check your network and retry."
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      fetchTasks();
    }
  }, [user, fetchTasks, refreshTrigger]);

  useEffect(() => {
    if (onAddTaskTrigger) {
      handleOpenCreateModal();
      setOnAddTaskTrigger(false);
    }
  }, [onAddTaskTrigger, setOnAddTaskTrigger]);

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = useCallback((task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  }, []);

  const handleSaveTask = async (taskData) => {
    if (!user?.uid) return;
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, taskData);
        showToast("Task updated successfully!", "success");
      } else {
        await addTask(taskData);
        showToast("Task created successfully!", "success");
      }
      setIsFormModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast("Unable to update task.", "error");
      fetchTasks();
    }
  };

  // Triggers confirmation modal before complete
  const handleCompleteTaskClick = useCallback((task) => {
    setConfirmModal({
      isOpen: true,
      title: "Complete Task?",
      message: "Are you sure you want to mark this task as completed? This will move it to the Completed category.",
      type: "success",
      confirmText: "Mark Completed",
      onConfirm: () => executeCompleteTask(task)
    });
  }, []);

  const executeCompleteTask = async (taskObj) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      await updateTask(taskObj._id, { ...taskObj, status: "Completed" });
      showToast("Task marked completed!", "success");
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast("Unable to update task.", "error");
      fetchTasks();
    }
  };

  // Triggers confirmation modal before delete
  const handleDeleteTaskClick = useCallback((id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Task?",
      message: "This action is permanent and cannot be undone. Are you sure you want to delete this task?",
      type: "danger",
      confirmText: "Delete Task",
      onConfirm: () => executeDeleteTask(id)
    });
  }, [tasks]);

  const executeDeleteTask = async (id) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      await deleteTask(id);
      showToast("Task deleted successfully.", "success");
      fetchTasks();
    } catch (err) {
      console.error(err);
      showToast("Unable to delete task.", "error");
      fetchTasks();
    }
  };

  // Metrics calculations
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, inProgress, completed, percentage };
  }, [tasks]);

  // Weekly activity metrics helper (matches creation times to days of the week)
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    tasks.forEach((task) => {
      const date = task.createdAt ? new Date(task.createdAt) : new Date();
      // Adjust day matching (0 is Sunday, map so Mon=0, Sun=6)
      let dayIdx = date.getDay() - 1;
      if (dayIdx === -1) dayIdx = 6;
      if (dayIdx >= 0 && dayIdx < 7) {
        counts[dayIdx] += 1;
      }
    });

    const maxVal = Math.max(...counts, 1);
    return days.map((day, idx) => ({
      day,
      count: counts[idx],
      percent: (counts[idx] / maxVal) * 100
    }));
  }, [tasks]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || descMatch;
      
      if (activeFilter === "All") return matchesSearch;
      return matchesSearch && task.status === activeFilter;
    });
  }, [tasks, searchQuery, activeFilter]);

  // Sorting
  const sortedTasks = useMemo(() => {
    const list = [...filteredTasks];
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "alphabetical") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filteredTasks, sortBy]);

  // Circle dimensions for monochrome animated SVG doughnut
  const radius = 35;
  const strokeDash = 2 * Math.PI * radius;
  const compDashOffset = strokeDash - (stats.percentage / 100) * strokeDash;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="w-full max-w-7xl mx-auto px-6 py-8 flex-grow select-none"
    >
      {/* Title */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-0.5 text-[var(--text-main)]">Dashboard</h2>
          <p className="text-xs text-[var(--text-muted)] font-medium">Overview of task accomplishments and progress statistics</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer flex items-center gap-1.5 border-0"
        >
          <Plus size={14} />
          <span>New Task</span>
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {loading && tasks.length === 0 ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-5 shadow-sm">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Total Tasks</span>
              <span className="text-2xl font-extrabold text-[var(--text-main)]">{stats.total}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-5 shadow-sm">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Pending</span>
              <span className="text-2xl font-extrabold text-[var(--text-muted)]">{stats.pending}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-5 shadow-sm">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">In Progress</span>
              <span className="text-2xl font-extrabold text-zinc-500">{stats.inProgress}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-5 shadow-sm">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Completed</span>
              <span className="text-2xl font-extrabold text-[var(--text-main)]">{stats.completed}</span>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-5 shadow-sm">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Completion Rate</span>
              <span className="text-2xl font-extrabold text-[var(--text-main)]">{stats.percentage}%</span>
            </div>
          </>
        )}
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Doughnut Chart representation */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 shrink-0">
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Completion Split</h4>
            <div className="space-y-2 text-[10px] font-semibold text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-white" />
                <span>Completed ({stats.completed})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                <span>In Progress ({stats.inProgress})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <span>Pending ({stats.pending})</span>
              </div>
            </div>
          </div>

          {/* SVG circle stroke representation */}
          <div className="relative w-[110px] h-[110px] flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="55" cy="55" r={radius} fill="transparent" stroke="var(--border-color)" strokeWidth="8" />
              {stats.total > 0 && (
                <motion.circle 
                  cx="55" 
                  cy="55" 
                  r={radius} 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8"
                  className="text-zinc-950 dark:text-white"
                  strokeDasharray={strokeDash}
                  initial={{ strokeDashoffset: strokeDash }}
                  animate={{ strokeDashoffset: compDashOffset }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              )}
            </svg>
            <span className="absolute text-xs font-extrabold text-[var(--text-main)]">{stats.percentage}%</span>
          </div>
        </div>

        {/* Weekly Activity representation */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Weekly Activity</h4>
          <div className="flex items-end justify-between gap-2 h-[80px] pt-2 border-b border-[var(--border-color)]">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full max-w-[20px] bg-zinc-200 dark:bg-zinc-800 rounded-t-sm h-[60px] relative flex items-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${d.percent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full bg-zinc-950 dark:bg-white rounded-t-sm"
                  />
                  {/* Tooltip */}
                  <span className="absolute -top-6 scale-0 group-hover:scale-100 bg-black text-white text-[8px] font-bold py-0.5 px-1.5 rounded transition-all select-none pointer-events-none">
                    {d.count}
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-[var(--text-muted)]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Filtering, Search & Sorting Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-grow max-w-[400px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workspace tasks..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2 pl-10 pr-4 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
        
        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown size={13} className="text-[var(--text-muted)]" />
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2 pl-3.5 pr-8 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter status pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["All", "Pending", "In Progress", "Completed"].map((filter) => {
          const count = 
            filter === "All" ? stats.total :
            filter === "Pending" ? stats.pending :
            filter === "In Progress" ? stats.inProgress : stats.completed;
          return (
            <button 
              key={filter}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeFilter === filter 
                  ? "bg-zinc-950 dark:bg-white text-white dark:text-black border-zinc-950 dark:border-white shadow-sm" 
                  : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-black dark:hover:border-white"
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter} ({count})
            </button>
          );
        })}
      </div>

      {/* Task Cards Workspace Grid */}
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
        </div>
      ) : (
        <div>
          {sortedTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] text-center py-16 flex flex-col items-center justify-center min-h-[300px] shadow-sm"
            >
              <Inbox size={40} className="mb-3 text-[var(--text-muted)]" />
              <h5 className="text-sm font-bold text-[var(--text-main)] mb-1">No tasks yet.</h5>
              <p className="text-xs text-[var(--text-muted)] max-w-xs leading-normal">
                {searchQuery ? "No matching results found." : "Create your first task checklist."}
              </p>
              {!searchQuery && (
                <button 
                  onClick={handleOpenCreateModal} 
                  className="px-4 py-2 border border-zinc-800 bg-zinc-950 text-white dark:bg-white dark:text-black text-xs font-bold cursor-pointer rounded-lg mt-5 border-0"
                >
                  Create First Task
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {sortedTasks.map((task) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    key={task._id} 
                  >
                    <TaskCard 
                      task={task}
                      onComplete={handleCompleteTaskClick}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTaskClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* Task Modal Details overlay */}
      <TaskFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />

    </motion.div>
  );
};

export default Dashboard;