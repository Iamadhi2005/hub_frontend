"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarEvent, TodoDueItem } from "@/types/calendar";

interface CalendarGridProps {
  initialEvents?: CalendarEvent[];
  initialTodos?: TodoDueItem[];
}

export default function CalendarGrid({ initialEvents = [], initialTodos = [] }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 1. Get calculations for month dates matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate date array representation blocks
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  // Month navigation handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full bg-white rounded-xl border border-cixio-light p-4 shadow-sm">
      {/* Calendar Grid Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-cixio-dark">
          {monthNames[month]} <span className="text-cixio-muted font-normal">{year}</span>
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-cixio-light hover:bg-cixio-bg text-cixio-dark transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-cixio-light hover:bg-cixio-bg text-cixio-dark transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week Day Header Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {dayLabels.map((label) => (
          <div key={label} className="text-[11px] font-semibold text-cixio-muted uppercase tracking-wider py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar Day Grid Blocks */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((day, idx) => {
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={idx}
              className={`min-h-[55px] p-1 border border-slate-100 rounded-lg flex flex-col justify-between transition-all
                ${day ? "bg-white" : "bg-slate-50/50 border-none"}
                ${isToday ? "ring-1 ring-cixio-blue bg-cixio-light/40" : ""}
              `}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md w-fit ${
                    isToday ? "bg-cixio-blue text-white" : "text-cixio-dark"
                  }`}>
                    {day}
                  </span>
                  
                  {/* Subtle data indicator indicators */}
                  <div className="w-full space-y-0.5 mt-1 overflow-hidden">
                    {initialEvents.some(e => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === month) && (
                      <div className="w-full h-1 bg-cixio-blue rounded-full" title="Scheduled Event" />
                    )}
                    {initialTodos.some(t => new Date(t.dueDate).getDate() === day && new Date(t.dueDate).getMonth() === month) && (
                      <div className="w-full h-1 bg-amber-500 rounded-full" title="Todo Deadline" />
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}