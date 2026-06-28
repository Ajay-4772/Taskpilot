import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-zinc-50" />;
      case "error":
        return <AlertTriangle size={16} className="text-zinc-400" />;
      case "info":
      default:
        return <Info size={16} className="text-zinc-400" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Target Container */}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto flex items-center justify-between gap-3 w-full bg-zinc-950 border border-zinc-800 text-zinc-50 rounded-xl py-3.5 px-4 shadow-xl select-none"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                  {getIcon(toast.type)}
                </span>
                <span className="text-xs font-semibold leading-snug">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center p-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
