import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Check, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Dropdown Component matching Vercel/Linear design guidelines
const CustomDropdown = ({ value, onChange, options, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer font-bold select-none text-left"
      >
        <span>{value}</span>
        <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#3F3F46] rounded-xl shadow-lg overflow-hidden py-1"
          >
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors cursor-pointer border-0 ${
                    isSelected
                      ? "bg-zinc-100 dark:bg-[#3B82F6] text-[#111827] dark:text-[#FFFFFF]"
                      : "bg-transparent text-zinc-700 dark:text-[#FFFFFF] hover:bg-[#F4F4F5] dark:hover:bg-[#27272A]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Custom Date Picker with React Portal & Intelligent Viewport Positioning
const CustomDatePicker = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef(null);

  const [focusedDate, setFocusedDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  // Calculate viewport boundaries and open direction
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const calendarHeight = 292;
    const calendarWidth = 270;
    
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < calendarHeight && rect.top > calendarHeight;
    
    const top = openUpward ? rect.top - calendarHeight - 4 : rect.bottom + 4;
    let left = rect.left;
    
    // Prevent left/right viewport overflow
    if (left + calendarWidth > window.innerWidth) {
      left = window.innerWidth - calendarWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }
    
    setCoords({ top, left, openUpward });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Listen to scroll events on capture phase (captures scrolls inside scrollable modals)
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFocusedDate(value ? new Date(value) : new Date());
    }
  }, [isOpen, value]);

  // Click outside listener
  const pickerContainerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ensure we don't close if clicking the button itself
      if (buttonRef.current && buttonRef.current.contains(event.target)) return;
      if (pickerContainerRef.current && !pickerContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "Select Due Date";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(new Date(year, month, i));
  }

  const handleDaySelect = (dayDate) => {
    if (!dayDate) return;
    const formatted = dayDate.toISOString().split("T")[0]; // YYYY-MM-DD
    onChange(formatted);
    setIsOpen(false);
  };

  const isToday = (dayDate) => {
    if (!dayDate) return false;
    const today = new Date();
    return today.getDate() === dayDate.getDate() &&
           today.getMonth() === dayDate.getMonth() &&
           today.getFullYear() === dayDate.getFullYear();
  };

  const isSelected = (dayDate) => {
    if (!dayDate || !value) return false;
    const valDate = new Date(value);
    return valDate.getDate() === dayDate.getDate() &&
           valDate.getMonth() === dayDate.getMonth() &&
           valDate.getFullYear() === dayDate.getFullYear();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      let nextDate = new Date(focusedDate);

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "Enter":
          e.preventDefault();
          handleDaySelect(focusedDate);
          break;
        case "ArrowDown":
          e.preventDefault();
          nextDate.setDate(focusedDate.getDate() + 7);
          setFocusedDate(nextDate);
          setCurrentDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          nextDate.setDate(focusedDate.getDate() - 7);
          setFocusedDate(nextDate);
          setCurrentDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextDate.setDate(focusedDate.getDate() - 1);
          setFocusedDate(nextDate);
          setCurrentDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          nextDate.setDate(focusedDate.getDate() + 1);
          setFocusedDate(nextDate);
          setCurrentDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, focusedDate]);

  const calendarContent = (
    <div 
      ref={pickerContainerRef} 
      style={{ 
        position: "fixed", 
        top: coords.top, 
        left: coords.left, 
        zIndex: 99999 
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: coords.openUpward ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: coords.openUpward ? 8 : -8 }}
            transition={{ duration: 0.18 }}
            className="w-[270px] bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#3F3F46] rounded-2xl shadow-xl p-4 select-none"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] rounded-lg transition-colors border-0 bg-transparent text-[var(--text-main)] cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-[var(--text-main)]">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] rounded-lg transition-colors border-0 bg-transparent text-[var(--text-main)] cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span key={day} className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  {day}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {cells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} />;
                }
                const selected = isSelected(cell);
                const today = isToday(cell);
                const isFocused = focusedDate.getDate() === cell.getDate() &&
                                 focusedDate.getMonth() === cell.getMonth() &&
                                 focusedDate.getFullYear() === cell.getFullYear();
                return (
                  <button
                    key={cell.getTime()}
                    type="button"
                    onClick={() => handleDaySelect(cell)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-0 flex items-center justify-center ${
                      selected
                        ? "bg-black dark:bg-[#3B82F6] text-white dark:text-[#FFFFFF]"
                        : today
                        ? "bg-zinc-100 dark:bg-[#27272A] text-black dark:text-[#3B82F6] border border-[#3B82F6]"
                        : isFocused
                        ? "ring-2 ring-[#3B82F6] dark:ring-offset-transparent bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-[#FFFFFF]"
                        : "bg-transparent text-zinc-800 dark:text-[#FFFFFF] hover:bg-[#F4F4F5] dark:hover:bg-[#27272A]"
                    }`}
                  >
                    {cell.getDate()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-black dark:focus:border-white transition-all cursor-pointer font-bold select-none text-left"
      >
        <span>{formatDateLabel(value)}</span>
        <CalendarIcon size={14} className="text-[var(--text-muted)]" />
      </button>

      {isOpen && createPortal(calendarContent, document.body)}
    </div>
  );
};

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || description.length < 20) return;

    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = title.trim().length > 0 && description.length >= 20;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl"
          >
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

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Status</label>
                  <CustomDropdown 
                    value={status} 
                    onChange={setStatus}
                    options={["Pending", "In Progress", "Completed"]}
                    disabled={submitting}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Priority</label>
                  <CustomDropdown 
                    value={priority} 
                    onChange={setPriority}
                    options={["Low", "Medium", "High"]}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1">Due Date</label>
                <CustomDatePicker 
                  value={dueDate}
                  onChange={setDueDate}
                  disabled={submitting}
                />
              </div>

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
