import React from "react";
import { WifiOff, ServerCrash, Database, Compass, RefreshCw } from "lucide-react";

const ErrorState = ({ type = "server", message, onRetry }) => {
  const getIcon = () => {
    switch (type) {
      case "internet":
        return <WifiOff size={48} className="text-amber-500 animate-bounce" />;
      case "database":
        return <Database size={48} className="text-rose-500 animate-pulse" />;
      case "404":
        return <Compass size={48} className="text-blue-500" />;
      case "server":
      default:
        return <ServerCrash size={48} className="text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "internet":
        return "No Internet Connection";
      case "database":
        return "Database Connection Error";
      case "404":
        return "Resource Not Found";
      case "server":
      default:
        return "Unable to Connect to Server";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] shadow-sm max-w-md mx-auto text-center my-6">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-4 shadow-inner">
        {getIcon()}
      </div>
      <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">{getTitle()}</h3>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6 max-w-xs">
        {message || "We couldn't connect to our systems. Please verify your connection status and try again."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7C5CFC] hover:bg-[#6344e3] active:scale-95 transition-all text-white text-xs font-semibold shadow-md shadow-[#7C5CFC]/20 cursor-pointer border-0"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
