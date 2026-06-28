import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check } from "lucide-react";

const TaskFormModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  
  const [focusedField, setFocusedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setStatus(taskToEdit.status || "Pending");
      setPriority(taskToEdit.priority || "Low");
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
      setPriority("Low");
      setDueDate("");
    }
  }, [taskToEdit, isOpen]);

  const isValid = title.trim().length > 0 && description.length >= 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null
      };
      await onSave(taskData);
    } catch (err) {
      console.error("Error submitting task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-[500px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 shadow-2xl text-[var(--text-main)]"
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-full border-0 bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold mb-6 tracking-tight text-[var(--text-main)]">
              {taskToEdit ? "Edit Task Details" : "Create New Task"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title (Floating label outline) */}
              <div className="flex flex-col gap-1">
                <div className="relative w-full">
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setFocusedField("title")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-3 px-4 pt-5 pb-1 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all"
                    disabled={submitting}
                    required
                  />
                  <label className={`absolute left-4 transition-all pointer-events-none font-bold ${
                    focusedField === "title" || title 
                      ? "top-1 text-[9px] text-[var(--text-main)]" 
                      : "top-3.5 text-[var(--text-muted)] text-xs font-normal"
                  }`}>
                    Task Title
                  </label>
                </div>
                {title.trim().length === 0 && (
                  <span className="text-[9px] font-bold text-red-500 pl-1">Title is required.</span>
                )}
              </div>

              {/* Description (Floating label + character counter) */}
              <div className="flex flex-col gap-1">
                <div className="relative w-full">
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-3 px-4 pt-5 pb-1 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none"
                    disabled={submitting}
                    required
                  />
                  <label className={`absolute left-4 transition-all pointer-events-none font-bold ${
                    focusedField === "description" || description 
                      ? "top-1 text-[9px] text-[var(--text-main)]" 
                      : "top-3.5 text-[var(--text-muted)] text-xs font-normal"
                  }`}>
                    Detailed Description
                  </label>
                </div>
                <div className="flex justify-between items-center px-1">
                  {description.length < 20 ? (
                    <span className="text-[9px] font-bold text-red-500">Min 20 characters required.</span>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5 select-none">
                      <Check size={11} /> Satisfied
                    </span>
                  )}
                  <span className={`text-[9px] font-bold ${description.length < 20 ? "text-amber-500" : "text-emerald-500"}`}>
                    {description.length} characters
                  </span>
                </div>
              </div>

              {/* Status & Priority selects */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer font-bold"
                    disabled={submitting}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer font-bold"
                    disabled={submitting}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all font-bold"
                  disabled={submitting}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-4 border-t border-[var(--border-color)] pt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-[var(--text-main)] transition-all cursor-pointer bg-transparent"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold transition-all cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isValid || submitting}
                >
                  {submitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{taskToEdit ? "Save Changes" : "Add Task"}</span>
                  )}
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
