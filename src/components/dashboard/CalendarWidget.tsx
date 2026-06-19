"use client";

export default function CalendarWidget() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm min-h-[245px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-100">Calendar</h2>
          <p className="text-xs text-gray-400">Upcoming events and reminders</p>
        </div>
        <span className="text-xs text-cixio-blue">Today</span>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400">09:00 AM</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Team standup</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review progress and blockers</p>
        </div>
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400">11:30 AM</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Product sync</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Planning for next release</p>
        </div>
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-400">02:00 PM</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Customer review</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Demo new document workflows</p>
        </div>
      </div>
    </div>
  );
}
