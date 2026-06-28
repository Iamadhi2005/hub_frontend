"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Task, TaskFormData } from "@/components/todos/types";
import {
  createTask,
  deleteTask,
  loadTasks,
  toggleSubtask,
  updateTask,
} from "@/components/todos/taskStore";

type TasksContextType = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (data: TaskFormData) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await loadTasks();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await createTask(data);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      throw err;
    }
  };

  const handleUpdateTask = async (id: string, data: Partial<Task>) => {
    try {
      await updateTask(id, data);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      throw err;
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      throw err;
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      await toggleSubtask(taskId, subtaskId);
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to toggle subtask");
      throw err;
    }
  };

  const value = useMemo(
    () => ({
      tasks,
      loading,
      error,
      createTask: handleCreateTask,
      updateTask: handleUpdateTask,
      deleteTask: handleDeleteTask,
      toggleSubtask: handleToggleSubtask,
      refreshTasks: fetchTasks,
    }),
    [tasks, loading, error]
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
