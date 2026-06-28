import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 p-4 rounded-2xl border shadow-xl pointer-events-auto backdrop-blur-md transition-all ${
                toast.type === "success"
                  ? "border-emerald-500/20 bg-emerald-950/85 text-emerald-100"
                  : toast.type === "error"
                  ? "border-rose-500/20 bg-rose-950/85 text-rose-100"
                  : toast.type === "warning"
                  ? "border-amber-500/20 bg-amber-950/85 text-amber-100"
                  : "border-[#7C5CFC]/20 bg-slate-900/85 text-slate-100"
              }`}
            >
              <div className="shrink-0">
                {toast.type === "success" && <CheckCircle size={18} className="text-emerald-400" />}
                {toast.type === "error" && <XCircle size={18} className="text-rose-400" />}
                {toast.type === "warning" && <AlertCircle size={18} className="text-amber-400" />}
                {toast.type === "info" && <Info size={18} className="text-[#A78BFA]" />}
              </div>
              <p className="text-xs font-semibold flex-grow leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 p-0.5 rounded-full hover:bg-white/10 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center text-current"
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
