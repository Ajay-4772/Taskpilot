import React from "react";
import { Calendar, Trash2, Edit3, CheckCircle2, AlertCircle } from "lucide-react";

const TaskCard = ({ task, onComplete, onEdit, onDelete }) => {
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "badge-high";
      case "low":
        return "badge-low";
      default:
        return "badge-medium";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "badge-completed";
      case "In Progress":
        return "badge-in-progress";
      default:
        return "badge-pending";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === "Completed") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm hover:shadow-[var(--shadow-glow-current)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full min-h-[220px]">
      <div>
        {/* Header Tags */}
        <div className="flex justify-between items-center mb-4">
          <span className={`saas-badge ${getPriorityClass(task.priority)}`}>
            {task.priority || "Medium"} Priority
          </span>
          <span className={`saas-badge ${getStatusClass(task.status)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
            {task.status}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-[17px] font-bold text-[var(--text-main)] mb-2 leading-snug group-hover:text-primary transition-colors">
          {task.title}
        </h4>
        
        {/* Description */}
        <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed line-clamp-3">
          {task.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-auto">
        {/* Date Row */}
        <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] font-medium">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Created: {formatDate(task.createdAt || task.created_at)}</span>
          </div>

          {task.dueDate && (
            <div className={`flex items-center gap-1 font-semibold ${
              isOverdue() ? "text-red-500 animate-pulse" : "text-[var(--text-muted)]"
            }`}>
              {isOverdue() ? <AlertCircle size={12} /> : <Calendar size={12} />}
              <span>Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              {isOverdue() && <span>(Overdue)</span>}
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex justify-end items-center gap-2 mt-4">
          {task.status !== "Completed" && (
            <button 
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/25 px-2.5 py-1.5 rounded-lg border-0 transition-all cursor-pointer"
              onClick={() => onComplete(task._id)}
              title="Mark Completed"
            >
              <CheckCircle2 size={13} />
              <span>Complete</span>
            </button>
          )}

          <button 
            className="flex items-center gap-1 text-[11px] font-bold text-[#7C5CFC] bg-[#7C5CFC]/10 hover:bg-[#7C5CFC]/25 px-2.5 py-1.5 rounded-lg border-0 transition-all cursor-pointer"
            onClick={() => onEdit(task)}
            title="Edit Task"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>

          <button 
            className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/25 px-2.5 py-1.5 rounded-lg border-0 transition-all cursor-pointer"
            onClick={() => onDelete(task._id)}
            title="Delete Task"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
