"use client";

import api from "@/lib/api";
import { Task, TaskFormData, Subtask } from "./types";

// Helper to serialize TaskFormData to backend Todo format
function toBackend(data: TaskFormData) {
  // Append tags and status to description so they persist without migrations
  let description = data.description || "";
  if (data.tags && data.tags.length > 0) {
    description += `\nTags: ${data.tags.join(",")}`;
  }
  description += `\nStatus: ${data.status}`;

  const completed = data.status === "done";

  return {
    title: data.title,
    description: description,
    priority: data.priority,
    completed: completed,
    due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
  };
}

// Helper to parse backend Todo to frontend Task format
function fromBackend(todo: any): Task {
  let description = todo.description || "";
  let tags: string[] = [];
  let status: "todo" | "in_progress" | "done" = "todo";

  // Parse tags
  const tagIndex = description.lastIndexOf("\nTags: ");
  if (tagIndex !== -1) {
    const tagsPart = description.substring(tagIndex + 7);
    const newlineIndex = tagsPart.indexOf("\n");
    const tagsStr = newlineIndex !== -1 ? tagsPart.substring(0, newlineIndex) : tagsPart;
    tags = tagsStr.split(",").map((t: string) => t.trim()).filter(Boolean);
    description = description.substring(0, tagIndex) + (newlineIndex !== -1 ? tagsPart.substring(newlineIndex) : "");
  }

  // Parse status
  const statusIndex = description.lastIndexOf("\nStatus: ");
  if (statusIndex !== -1) {
    const statusPart = description.substring(statusIndex + 9).trim();
    if (statusPart === "in_progress" || statusPart === "todo" || statusPart === "done") {
      status = statusPart as any;
    }
    description = description.substring(0, statusIndex);
  } else if (todo.completed) {
    status = "done";
  }

  // Parse subtasks
  const subtasks: Subtask[] = (todo.subtasks || []).map((s: any) => ({
    id: String(s.id),
    title: s.title,
    done: Boolean(s.completed),
  }));

  // Parse dueDate
  let dueDate = "";
  if (todo.due_date) {
    dueDate = todo.due_date.split("T")[0];
  }

  return {
    id: String(todo.id),
    title: todo.title,
    description: description,
    priority: todo.priority,
    status: status,
    dueDate: dueDate,
    tags: tags,
    subtasks: subtasks,
    createdAt: todo.created_at || new Date().toISOString(),
  };
}

export async function loadTasks(): Promise<Task[]> {
  const res = await api.get("/todos/");
  return res.data.map(fromBackend);
}

export async function createTask(data: TaskFormData): Promise<Task> {
  const payload = toBackend(data);
  const res = await api.post("/todos/", payload);
  const createdTodo = res.data;

  // Save subtasks if any
  if (data.subtasks && data.subtasks.length > 0) {
    for (const sub of data.subtasks) {
      await api.post(`/todos/${createdTodo.id}/subtasks`, { title: sub.title });
    }
  }

  // Reload the created task with its subtasks
  const reloadRes = await api.get(`/todos/`);
  const finalTodo = reloadRes.data.find((t: any) => String(t.id) === createdTodo.id);
  return fromBackend(finalTodo || createdTodo);
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  // If status is changed, update the completion status endpoint
  if (data.status !== undefined) {
    const completed = data.status === "done";
    await api.put(`/todos/${id}/complete`, { completed });
  }

  const payload: any = {};
  if (data.title !== undefined) payload.title = data.title;

  if (data.description !== undefined || data.tags !== undefined || data.status !== undefined) {
    let finalDescription = data.description !== undefined ? data.description : "";
    const finalTags = data.tags || [];
    const finalStatus = data.status || "todo";

    if (finalTags.length > 0) {
      finalDescription += `\nTags: ${finalTags.join(",")}`;
    }
    finalDescription += `\nStatus: ${finalStatus}`;
    payload.description = finalDescription;
  }

  if (data.priority !== undefined) payload.priority = data.priority;
  if (data.dueDate !== undefined) {
    payload.due_date = data.dueDate ? new Date(data.dueDate).toISOString() : null;
  }

  let updatedTodoRes = null;
  if (Object.keys(payload).length > 0) {
    updatedTodoRes = await api.put(`/todos/${id}`, payload);
  }

  // Handle subtasks additions and deletions
  if (data.subtasks !== undefined) {
    const currentSubsRes = await api.get(`/todos/${id}/subtasks`);
    const currentSubs = currentSubsRes.data;

    // Delete removed ones
    const toDelete = currentSubs.filter(
      (cs: any) => !data.subtasks?.some((ds) => ds.id === String(cs.id))
    );
    for (const sub of toDelete) {
      await api.delete(`/todos/${id}/subtasks/${sub.id}`);
    }

    // Add new ones
    const toAdd = data.subtasks.filter(
      (ds) => !currentSubs.some((cs: any) => String(cs.id) === ds.id)
    );
    for (const sub of toAdd) {
      await api.post(`/todos/${id}/subtasks`, { title: sub.title });
    }
  }

  const reloadRes = await api.get(`/todos/`);
  const finalTodo = reloadRes.data.find((t: any) => String(t.id) === id);
  return fromBackend(finalTodo);
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/todos/${id}`);
}

export async function toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
  const currentSubsRes = await api.get(`/todos/${taskId}/subtasks`);
  const subtask = currentSubsRes.data.find((s: any) => String(s.id) === subtaskId);
  if (subtask) {
    await api.put(`/todos/${taskId}/subtasks/${subtaskId}`, {
      title: subtask.title,
      completed: !subtask.completed,
    });
  }
}
