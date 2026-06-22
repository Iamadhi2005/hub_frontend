"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/store/tasksContext";
import { groupTodosByDate, formatDateKey } from "@/lib/calendarUtils";
import { PRIORITY_COLORS } from "@/lib/priorityColors";
import { Task } from "@/components/todos/types";

export default function CalendarGrid() {
  const { tasks } = useTasks();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026

  // This is the ENTIRE "sync" mechanism — group whatever tasks exist by due date.
  // No copying, no separate calendar_events table needed for this feature.
  const todosByDate = groupTodosByDate(tasks);

  function goToTodo(task: Task) {
    // Per the requirement: clicking takes you to /todos
    router.push("/todos");
  }

  // Build the grid of day cells for the current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: { day: number; dateKey: string }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateKey: formatDateKey(year, month, d) });
  }

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-medium">Calendar</h1>
        <p className="text-sm text-gray-500">Due dates are pulled live from your Todos</p>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="w-8 h-8 border rounded-md dark:border-gray-700"
        >‹</button>
        <span className="font-medium">{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</span>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="w-8 h-8 border rounded-md dark:border-gray-700"
        >›</button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-600" /> High priority</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-600" /> Medium priority</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Low priority</span>
      </div>

      <div className="grid grid-cols-7 border rounded-lg overflow-hidden dark:border-gray-700">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-xs text-center py-2 bg-gray-50 dark:bg-gray-800 text-gray-500">{d}</div>
        ))}

        {/* Leading blanks before day 1 */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`blank-${i}`} className="min-h-[78px] border-t border-l bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
        ))}

        {cells.map(({ day, dateKey }) => {
          const dayTodos = todosByDate[dateKey] ?? [];
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              className={`min-h-[78px] border-t border-l p-1 dark:border-gray-700 ${isToday ? "bg-purple-50 dark:bg-purple-900/20" : ""}`}
            >
              <span className="text-xs text-gray-500">{day}</span>

              {dayTodos.slice(0, 2).map((task) => (
                <button
                  key={task.id}
                  onClick={() => goToTodo(task)}
                  className={`block w-full text-left text-[10px] rounded px-1 py-0.5 mt-0.5 truncate ${PRIORITY_COLORS[task.priority]}`}
                  title={`${task.title} — due ${task.dueDate}`}
                >
                  <span className="font-medium">{task.title}</span>
                  <span className="block text-[9px] text-gray-400 mt-0.5">Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </button>
              ))}

              {dayTodos.length > 2 && (
                <p className="text-[10px] text-gray-400 mt-0.5">+{dayTodos.length - 2} more</p>
              )}
            </div>
          );
        })}
      </div>

      {tasks && tasks.filter((t) => t.dueDate).length === 0 && (
        <div className="mt-4 border border-dashed rounded-xl p-6 text-center text-sm text-gray-400 dark:border-gray-700">
          No tasks have due dates yet — add one from the Todos page and it'll show up here automatically
        </div>
      )}
    </main>
  );
}