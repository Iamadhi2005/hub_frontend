"use client";

export type FocusRecord = {
  date: string; // YYYY-MM-DD
  minutes: number;
};

const FOCUS_STORAGE_KEY = "smarthub_focus_history";

export function loadFocusHistory(): FocusRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) {
      // Seed some mock data for the last 7 days so it looks populated and beautiful!
      const mockData = getMockWeeklyFocusData();
      localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(mockData));
      return mockData;
    }
    return JSON.parse(raw) as FocusRecord[];
  } catch {
    return [];
  }
}

export function saveFocusHistory(history: FocusRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(history));
}

export function logFocusSession(minutes: number = 25): FocusRecord[] {
  const history = loadFocusHistory();
  const todayKey = new Date().toISOString().split("T")[0];
  
  const existingIndex = history.findIndex((r) => r.date === todayKey);
  if (existingIndex > -1) {
    history[existingIndex].minutes += minutes;
  } else {
    history.push({ date: todayKey, minutes });
  }
  
  saveFocusHistory(history);
  return history;
}

function getMockWeeklyFocusData(): FocusRecord[] {
  const data: FocusRecord[] = [];
  const today = new Date();
  
  // Seed data for the last 7 days (including today) with 0 minutes (clean start)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    
    data.push({ date: dateKey, minutes: 0 });
  }
  return data;
}
