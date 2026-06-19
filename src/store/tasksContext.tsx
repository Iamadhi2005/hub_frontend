"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Task, TaskFormData } from "@/components/todos/types";
import {
  createTask,
  deleteTask,
  loadTasks,
  saveTasks,
  toggleSubtask,
  updateTask,
} from "@/components/todos/taskStore";

type TasksContextType = {
  tasks: Task[];
  createTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveTasks(tasks);
  }, [loaded, tasks]);

  const value = useMemo(
    () => ({
      tasks,
      createTask: (data: TaskFormData) => setTasks((prev) => createTask(prev, data)),
      updateTask: (id: string, data: Partial<Task>) => setTasks((prev) => updateTask(prev, id, data)),
      deleteTask: (id: string) => setTasks((prev) => deleteTask(prev, id)),
      toggleSubtask: (taskId: string, subtaskId: string) =>
        setTasks((prev) => toggleSubtask(prev, taskId, subtaskId)),
    }),
    [tasks]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return context;
}
