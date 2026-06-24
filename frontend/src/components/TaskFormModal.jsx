import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Swal from "sweetalert2";

const TaskFormModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setStatus(taskToEdit.status || "Pending");
      setPriority(taskToEdit.priority || "Medium");
      if (taskToEdit.dueDate) {
        const dateObj = new Date(taskToEdit.dueDate);
        const formattedDate = dateObj.toISOString().split("T")[0];
        setDueDate(formattedDate);
      } else {
        setDueDate("");
      }
    } else {
      setTitle("");
      setDescription("");
      setStatus("Pending");
      setPriority("Medium");
      setDueDate("");
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Task Title is required",
        confirmButtonColor: "#7C5CFC"
      });
      return;
    }

    if (description.length < 20) {
      Swal.fire({
        icon: "warning",
        title: "Description Too Short",
        text: "Description must be at least 20 characters long.",
        confirmButtonColor: "#7C5CFC"
      });
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null
    };

    onSave(taskData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/60 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-[500px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-xl text-[var(--text-main)]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full border-0 bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-bold mb-5 tracking-tight">
              {taskToEdit ? "Edit Task" : "Create New Task"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Task Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design Dashboard UI" 
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2 px-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Description textarea */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Description</label>
                  <span className={`text-[10px] ${description.length < 20 ? "text-red-500" : "text-emerald-500"}`}>
                    {description.length}/20 min chars
                  </span>
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of the task (minimum 20 characters)..." 
                  rows={4}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2 px-4 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2 px-4 text-sm text-[var(--text-main)] focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="btn-saas-secondary py-2 px-4 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-saas-primary py-2 px-5 text-sm cursor-pointer"
                >
                  {taskToEdit ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskFormModal;
