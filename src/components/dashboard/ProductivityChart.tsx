"use client";

import { useEffect, useState, useMemo } from "react";
import { loadFocusHistory, FocusRecord } from "@/lib/focusStore";
import { Target, TrendingUp, Zap, Sparkles } from "lucide-react";

export default function ProductivityChart() {
  const [history, setHistory] = useState<FocusRecord[]>([]);

  // Function to reload logs from localStorage
  const refreshHistory = () => {
    setHistory(loadFocusHistory());
  };

  // Initial load
  useEffect(() => {
    refreshHistory();

    // Listen for custom event when timer completes a work session
    if (typeof window !== "undefined") {
      window.addEventListener("focus-session-completed", refreshHistory);
      return () => {
        window.removeEventListener("focus-session-completed", refreshHistory);
      };
    }
  }, []);

  // Compute the last 7 calendar days (ending with today)
  const chartData = useMemo(() => {
    const today = new Date();
    const result: { date: string; label: string; minutes: number; isToday: boolean }[] = [];
    const todayStr = today.toISOString().split("T")[0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Mon", "Tue"
      
      // Find logged minutes for this date
      const record = history.find((r) => r.date === dateStr);
      const minutes = record ? record.minutes : 0;
      
      result.push({
        date: dateStr,
        label: dayLabel,
        minutes,
        isToday: dateStr === todayStr
      });
    }
    return result;
  }, [history]);

  // Calculations for stats
  const totalMinutes = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.minutes, 0);
  }, [chartData]);

  const weeklyHours = (totalMinutes / 60).toFixed(1);
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 60); // minimum scale is 60m

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between min-h-[300px]">
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center text-cyan-500">
            <Target size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Weekly Focus</h2>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">7-day cognitive overview</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
          <TrendingUp size={10} />
          <span>Active</span>
        </div>
      </div>

      {/* Main summary values */}
      <div className="flex items-end gap-6 my-2">
        <div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {weeklyHours} hrs
          </span>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Focused this week</p>
        </div>
        <div className="border-l border-gray-100 dark:border-slate-800 h-8" />
        <div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {Math.round(totalMinutes / 25)}
          </span>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Pomodoro sets</p>
        </div>
      </div>

      {/* 7-Day Vertical Histogram Bar Chart */}
      <div className="flex justify-between items-end h-28 px-1 mt-4 mb-2">
        {chartData.map((d) => {
          const heightPct = Math.min((d.minutes / maxMinutes) * 100, 100);
          
          return (
            <div key={d.date} className="flex flex-col items-center flex-1 group relative">
              
              {/* Tooltip on hover */}
              <div className="absolute -top-7 scale-0 group-hover:scale-100 bg-gray-900 dark:bg-slate-850 text-white text-[9px] px-2 py-0.5 rounded shadow-lg transition-transform pointer-events-none z-10 whitespace-nowrap">
                {d.minutes} mins
              </div>

              {/* Interactive Bar */}
              <div className="w-6 sm:w-8 bg-gray-50 dark:bg-slate-800/40 rounded-t-lg h-24 flex items-end overflow-hidden border border-gray-100/50 dark:border-slate-800/30">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 origin-bottom ${
                    d.isToday
                      ? "bg-gradient-to-t from-cyan-500 to-indigo-500 shadow-sm shadow-cyan-500/20"
                      : "bg-gradient-to-t from-indigo-500/60 to-cyan-500/50 dark:from-indigo-600/40 dark:to-cyan-600/30 group-hover:from-indigo-500/80 group-hover:to-cyan-500/70"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Day Label */}
              <span className={`text-[10px] mt-2 font-medium tracking-wide ${
                d.isToday ? "text-cyan-500 font-bold" : "text-gray-400 dark:text-slate-500"
              }`}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-slate-500 mt-2 border-t border-gray-50 dark:border-slate-800 pt-3">
        <Sparkles size={11} className="text-cyan-400" />
        <span>Focus Timer sets feed directly into this overview.</span>
      </div>
    </div>
  );
}
