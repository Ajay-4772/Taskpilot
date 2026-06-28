import React from "react";

export const StatsCardSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm animate-pulse flex flex-col gap-2">
    <div className="h-8 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
    <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-900 rounded" />
  </div>
);

export const TaskCardSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-6 shadow-sm animate-pulse flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
    </div>
    <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)]">
      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="flex gap-2">
        <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-7 w-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-8 max-w-2xl mx-auto shadow-sm animate-pulse flex flex-col items-center gap-6">
    <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
    <div className="space-y-2 flex flex-col items-center w-full">
      <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
    </div>
    <div className="w-full space-y-4 pt-6 border-t border-[var(--border-color)]">
      <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
    </div>
  </div>
);

export const AuthSkeleton = () => (
  <div className="bg-zinc-950 border border-zinc-800 rounded-[20px] p-8 max-w-md w-full mx-auto shadow-2xl animate-pulse flex flex-col gap-6">
    <div className="h-6 w-32 bg-zinc-800 rounded" />
    <div className="space-y-4">
      <div className="h-10 w-full bg-zinc-900 border border-zinc-800 rounded-xl" />
      <div className="h-10 w-full bg-zinc-900 border border-zinc-800 rounded-xl" />
    </div>
    <div className="h-10 w-full bg-zinc-800 rounded-xl" />
  </div>
);
