"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
}

export default function CalendarWidget() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { data: events = [], isLoading, isError } = useQuery<CalendarEvent[]>({
    queryKey: ["dashboard-events", year, month + 1],
    queryFn: async () => {
      const res = await api.get<CalendarEvent[]>("/events", {
        params: { year, month: month + 1 },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const eventsByDay = useMemo(
    () =>
      events.reduce((acc, event) => {
        const key = event.date.slice(0, 10);
        acc[key] = acc[key] ? [...acc[key], event] : [event];
        return acc;
      }, {} as Record<string, CalendarEvent[]>),
    [events]
  );

  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function toKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function isToday(day: number) {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
    setSelected(null);
  }

  const selectedEvents = selected ? eventsByDay[selected] ?? [] : [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="text-gray-400 hover:text-gray-700 px-2 rounded-md transition"
          >
            ‹
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="text-gray-400 hover:text-gray-700 px-2 rounded-md transition"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2 animate-pulse">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="h-8 rounded-full bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-500">Unable to load your calendar events.</div>
      ) : (
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} />;

            const key = toKey(day);
            const dayEvents = eventsByDay[key] ?? [];
            const todayCell = isToday(day);
            const selectedCell = selected === key;

            return (
              <button
                key={key}
                onClick={() => setSelected(selectedCell ? null : key)}
                className={`relative mx-auto w-7 h-7 rounded-full text-xs transition-colors ${
                  todayCell
                    ? "bg-cixio-blue text-white font-semibold"
                    : selectedCell
                    ? "bg-blue-100 text-cixio-blue"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {day}
                {dayEvents.length > 0 && !todayCell && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-gray-400">No events on this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((event) => (
                <li key={event.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-gray-400 mt-1 text-[11px]">
                    {event.start_time ? `${event.start_time}` : "All day"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
