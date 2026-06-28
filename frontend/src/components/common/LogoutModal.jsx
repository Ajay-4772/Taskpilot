import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  // Listen for Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 opacity-60 hover:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center text-[var(--text-main)]"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Icon and Message */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full mb-4">
                <LogOut size={26} />
              </div>
              <h3 className="text-base font-extrabold text-[var(--text-main)] mb-1">
                Confirm Logout
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-[240px] leading-normal mb-6">
                Are you sure you want to logout?
              </p>

              {/* Action Buttons */}
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] text-xs font-semibold hover:border-slate-400 dark:hover:border-slate-600 transition-all text-[var(--text-main)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 transition-all text-white text-xs font-semibold shadow-md shadow-rose-500/20 cursor-pointer border-0"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
