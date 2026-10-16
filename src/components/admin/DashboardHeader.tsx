/**
 * Modern Dashboard Header - NewsPilot style
 * Purple gradient background with welcome message
 */
"use client";

import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  userName?: string;
  showQuickCreate?: boolean;
  onQuickCreate?: () => void;
}

export default function DashboardHeader({
  userName = "Demo Admin",
  showQuickCreate = true,
  onQuickCreate,
}: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("Welcome back");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Sabahınız xeyir");
    else if (hour < 18) setGreeting("Gününüz xeyir");
    else setGreeting("Axşamınız xeyir");

    // Update time
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="animate-fade-in">
          <p className="font-ui text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-purple-200">
            Nesreen Magazine İdarə Paneli
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white transition-all sm:text-3xl lg:text-4xl">
            {greeting}, {userName}
          </h1>
          <p className="mt-2 font-ui text-[12px] sm:text-[13px] text-purple-100">
            Nəşriyyatınızın son vəziyyətini burada görə bilərsiniz
          </p>
          {currentTime && (
            <p className="mt-1 font-ui text-[10px] sm:text-[11px] text-purple-200/80">
              📅 {currentTime}
            </p>
          )}
        </div>

        {showQuickCreate && (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onQuickCreate}
              className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 sm:flex-none sm:px-5 sm:py-3 font-ui text-[12px] sm:text-[13px] font-semibold text-purple-700 shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="hidden sm:inline">Tez Yarat</span>
              <span className="sm:hidden">Yarat</span>
            </button>

            <button
              type="button"
              className="hidden sm:flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 active:scale-100"
              aria-label="Yazıçılar"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Animated gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-pulse" />
    </div>
  );
}
