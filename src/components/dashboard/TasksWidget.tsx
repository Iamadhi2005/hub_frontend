"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

type Task = {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  due_date?: string;
};

const priorityColors = {
  high: "bg-red-100 text-red-600",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-500",
};

function formatDueDate(date?: string) {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function TasksWidget() {
  const { data: tasks = [], isLoading, isError } = useQuery<Task[]>({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      const res = await api.get<Task[]>("/tasks", { params: { limit: 5 } });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const remaining = useMemo(() => tasks.filter((task) => !task.completed).length, [tasks]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Tasks</h2>
        <span className="text-xs text-gray-400">
          {isLoading ? "Loading…" : `${remaining} remaining`}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-12 rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-500">Unable to load your tasks.</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          No tasks available.
          <div className="text-xs text-gray-400 mt-2">Create a task to see it here.</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={task.completed}
                disabled
                className="w-4 h-4 accent-purple-600 cursor-not-allowed"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">{formatDueDate(task.due_date)}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      )}

      <a href="/todos" className="block mt-4 text-xs text-purple-600 hover:underline text-center">
        View all tasks →
      </a>
    </div>
  );
}
