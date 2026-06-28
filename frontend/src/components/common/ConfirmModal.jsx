import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, LogOut, Mail, Lock, Trash2, X } from "lucide-react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = "danger", confirmText = "Confirm" }) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 size={22} className="text-zinc-50" />;
      case "warning":
        return <AlertTriangle size={22} className="text-zinc-50" />;
      case "success":
        return <CheckCircle2 size={22} className="text-zinc-50" />;
      case "logout":
        return <LogOut size={22} className="text-zinc-50" />;
      case "email":
        return <Mail size={22} className="text-zinc-50" />;
      case "password":
        return <Lock size={22} className="text-zinc-50" />;
      default:
        return <AlertTriangle size={22} className="text-zinc-50" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-[20px] p-6 shadow-2xl overflow-hidden text-zinc-50"
          >
            {/* Close Cross */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-200 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-full mb-4">
                {getIcon()}
              </div>
              <h3 className="text-base font-bold text-zinc-50 mb-1">{title}</h3>
              <p className="text-xs text-zinc-400 max-w-[250px] leading-normal mb-6">
                {message}
              </p>

              {/* Action Buttons */}
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-800 bg-transparent text-xs font-semibold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer border-0"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
