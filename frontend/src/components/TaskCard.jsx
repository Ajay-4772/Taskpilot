import React from "react";
import { Calendar, Trash2, Edit3, CheckCircle2, AlertCircle } from "lucide-react";

const TaskCard = React.memo(({ task, onComplete, onEdit, onDelete }) => {
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "border-zinc-800 bg-zinc-950 text-white dark:bg-white dark:text-black font-extrabold";
      case "medium":
        return "border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-200 font-bold";
      case "low":
      default:
        return "border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-400 dark:text-zinc-500 font-medium";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30";
      case "In Progress":
        return "bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700";
      case "Pending":
      default:
        return "bg-transparent text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length !== 3) return "";
    const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === "Completed") return false;
    const parts = task.dueDate.split("T")[0].split("-");
    if (parts.length !== 3) return false;
    const dueYear = parseInt(parts[0], 10);
    const dueMonth = parseInt(parts[1], 10) - 1;
    const dueDay = parseInt(parts[2], 10);
    const dueDateObj = new Date(dueYear, dueMonth, dueDay);
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dueDateObj < todayMidnight;
  };

  return (
    <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full min-h-[220px]">
      <div>
        {/* Header Tags */}
        <div className="flex justify-between items-center mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${getPriorityClass(task.priority)}`}>
            {task.priority || "Low"}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border flex items-center gap-1 font-bold ${getStatusClass(task.status)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {task.status}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-[var(--text-main)] mb-1 leading-snug group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
          {task.title}
        </h4>
        
        {/* Description */}
        <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed line-clamp-3">
          {task.description}
        </p>
      </div>

      {/* Footer Info & Action buttons */}
      <div className="mt-auto">
        {/* Date details */}
        <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-[var(--border-color)] text-[9px] text-[var(--text-muted)] font-medium">
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>Created: {formatDate(task.createdAt)}</span>
          </div>

          {task.dueDate && (
            <div className={`flex items-center gap-1 font-semibold ${
              isOverdue() ? "text-red-500" : "text-[var(--text-muted)]"
            }`}>
              {isOverdue() ? <AlertCircle size={11} className="animate-pulse" /> : <Calendar size={11} />}
              <span>Due: {formatDueDate(task.dueDate)}</span>
              {isOverdue() && <span>(Overdue)</span>}
            </div>
          )}
        </div>

        <div className="flex justify-end items-center gap-2 mt-4">
          {task.status === "Completed" ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/35 px-2.5 py-1.5 rounded-lg select-none">
              <CheckCircle2 size={12} />
              <span>Completed</span>
            </span>
          ) : (
            <>
              <button 
                type="button"
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)] hover:bg-zinc-200 dark:hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                onClick={() => onComplete(task)}
                title="Mark Completed"
              >
                <CheckCircle2 size={12} />
                <span>Complete</span>
              </button>

              <button 
                type="button"
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 border border-[var(--border-color)] hover:bg-zinc-200 dark:hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                onClick={() => onEdit(task)}
                title="Edit Task"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
            </>
          )}

          <button 
            type="button"
            className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-950 hover:bg-red-950/20 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            onClick={() => onDelete(task._id)}
            title="Delete Task"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
});

TaskCard.displayName = "TaskCard";

export default TaskCard;
