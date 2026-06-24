import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Inbox } from "lucide-react";
import { getTasks, addTask, updateTask, deleteTask } from "../services/taskService";
import TaskCard from "../components/TaskCard";
import TaskFormModal from "../components/TaskFormModal";

const Dashboard = ({ refreshTrigger, onAddTaskTrigger, setOnAddTaskTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  useEffect(() => {
    if (onAddTaskTrigger) {
      handleOpenCreateModal();
      setOnAddTaskTrigger(false);
    }
  }, [onAddTaskTrigger]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load tasks from database."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, taskData);
        setIsModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Task Updated",
          text: "Task modified successfully!",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await addTask(taskData);
        setIsModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Task Created",
          text: "Task added to dashboard!",
          timer: 1500,
          showConfirmButton: false
        });
      }
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to save",
        text: error.response?.data?.message || "Something went wrong."
      });
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      if (!task) return;

      await updateTask(id, { ...task, status: "Completed" });
      Swal.fire({
        icon: "success",
        title: "Completed!",
        text: "Task marked as completed.",
        timer: 1200,
        showConfirmButton: false
      });
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status."
      });
    }
  };

  const handleDeleteTask = async (id) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Task deleted successfully.",
          timer: 1200,
          showConfirmButton: false
        });
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete task."
        });
      }
    }
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "All") return matchesSearch;
    return matchesSearch && task.status === activeFilter;
  });

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
        {/* Total Tasks Card */}
        <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300 glass-card-dark">
          <div className="text-4xl font-extrabold mb-2 text-[#7C5CFC] group-hover:scale-105 transition-transform origin-left">
            {totalTasks}
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Total Tasks
          </div>
        </div>

        {/* Pending Card */}
        <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300 glass-card-dark">
          <div className="text-4xl font-extrabold mb-2 text-[var(--text-muted)] group-hover:scale-105 transition-transform origin-left">
            {pendingTasks}
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Pending
          </div>
        </div>

        {/* In Progress Card */}
        <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300 glass-card-dark">
          <div className="text-4xl font-extrabold mb-2 text-[#f59e0b] group-hover:scale-105 transition-transform origin-left">
            {inProgressTasks}
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            In Progress
          </div>
        </div>

        {/* Completed Card */}
        <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300 glass-card-dark">
          <div className="text-4xl font-extrabold mb-2 text-[#10b981] group-hover:scale-105 transition-transform origin-left">
            {completedTasks}
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Completed
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        {/* Search Input Bar (rounded-full) */}
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
        <button 
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === "All" 
              ? "bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/25" 
              : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary hover:text-primary"
          }`}
          onClick={() => setActiveFilter("All")}
        >
          All ({totalTasks})
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === "Pending" 
              ? "bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/25" 
              : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary hover:text-primary"
          }`}
          onClick={() => setActiveFilter("Pending")}
        >
          Pending ({pendingTasks})
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === "In Progress" 
              ? "bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/25" 
              : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary hover:text-primary"
          }`}
          onClick={() => setActiveFilter("In Progress")}
        >
          In Progress ({inProgressTasks})
        </button>
        <button 
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === "Completed" 
              ? "bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/25" 
              : "bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary hover:text-primary"
          }`}
          onClick={() => setActiveFilter("Completed")}
        >
          Completed ({completedTasks})
        </button>
      </div>

      {/* Task Cards Workspace */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#7C5CFC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {filteredTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] text-center py-16 flex flex-col items-center justify-center min-h-[300px] shadow-sm"
            >
              <Inbox size={44} className="mb-4 text-[var(--text-muted)]" />
              <h5 className="text-base font-bold text-[var(--text-main)] mb-1">No Tasks Found</h5>
              <p className="text-xs text-[var(--text-muted)] max-w-xs leading-normal">
                {searchQuery ? "Try resetting your search query or status filter." : "Get started by creating your first project task!"}
              </p>
              {!searchQuery && (
                <button 
                  onClick={handleOpenCreateModal} 
                  className="btn btn-saas-secondary mt-5 py-2 px-4 text-xs cursor-pointer rounded-full"
                >
                  <Plus size={14} className="mr-1" /> Add Task
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