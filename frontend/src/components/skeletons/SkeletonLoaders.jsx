import React from "react";

export const StatsCardSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm animate-pulse flex flex-col gap-2">
    <div className="h-9 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
  </div>
);

export const TaskCardSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm animate-pulse flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
      <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
    </div>
    <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)]">
      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="flex gap-2">
        <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-8 max-w-2xl mx-auto shadow-sm animate-pulse flex flex-col items-center gap-6">
    <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800" />
    <div className="space-y-2 flex flex-col items-center w-full">
      <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
    <div className="w-full space-y-4 pt-6 border-t border-[var(--border-color)]">
      <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  </div>
);
