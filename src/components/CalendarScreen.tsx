import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarScreenProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onAddTask: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  tasks,
  onSelectTask,
  onAddTask,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(24);

  const daysOfWeek = [
    { day: 'Mon', date: 21 },
    { day: 'Tue', date: 22 },
    { day: 'Wed', date: 23 },
    { day: 'Thu', date: 24, isToday: true },
    { day: 'Fri', date: 25 },
    { day: 'Sat', date: 26 },
    { day: 'Sun', date: 27 },
  ];

  const timeBlocks = [
    {
      time: '9:00 AM',
      event: {
        title: 'Morning Inbox & Daily Standup',
        category: 'Work',
        color: 'border-l-4 border-[#3525cd] bg-[#eaedff]',
        duration: '9:00 AM - 9:45 AM',
      },
    },
    {
      time: '10:00 AM',
      event: {
        title: 'AI Scheduled: Deep Focus Block',
        category: 'Deep Work',
        color: 'border-l-4 border-[#6b00b7] bg-[#f0dbff]/50',
        duration: '10:00 AM - 11:30 AM',
        badge: 'AI Suggested',
      },
    },
    {
      time: '12:00 PM',
      event: {
        title: 'Lunch & Wellness Break',
        category: 'Personal',
        color: 'border-l-4 border-emerald-500 bg-emerald-50',
        duration: '12:00 PM - 1:00 PM',
      },
    },
    {
      time: '1:30 PM',
      event: {
        title: 'Finalize Q3 Financial Report',
        category: 'Work',
        color: 'border-l-4 border-[#ba1a1a] bg-[#ffdad6]/40',
        duration: '1:30 PM - 2:00 PM',
        badge: 'High Priority',
        taskId: 'task-fin',
      },
    },
    {
      time: '2:00 PM',
      event: {
        title: 'Executive Sync with Elena V.',
        category: 'Work',
        color: 'border-l-4 border-[#00668a] bg-[#c4e7ff]/40',
        duration: '2:00 PM - 3:00 PM',
      },
    },
    {
      time: '3:30 PM',
      event: {
        title: 'Review design tokens & iOS sync',
        category: 'Product',
        color: 'border-l-4 border-amber-500 bg-amber-50',
        duration: '3:30 PM - 4:15 PM',
        taskId: 'task-design',
      },
    },
    {
      time: '4:00 PM',
      event: {
        title: 'Prepare Q4 Executive Strategy Presentation',
        category: 'Work',
        color: 'border-l-4 border-[#3525cd] bg-[#e2dfff]/60',
        duration: '4:00 PM - 5:30 PM',
        taskId: 'task-pres',
      },
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-36 pt-22 gap-4">
      {/* Calendar Header Month & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#131b2e]">October 2026</h2>
          <p className="text-[12px] text-[#464555]">Week 43 • 6 scheduled blocks</p>
        </div>

        <button
          onClick={onAddTask}
          className="h-9 px-3 bg-[#3525cd] text-white text-[12px] font-semibold rounded-full flex items-center gap-1 shadow-xs hover:opacity-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Block Time</span>
        </button>
      </div>

      {/* Week Day Selector Strip */}
      <div className="grid grid-cols-7 gap-1.5 p-2 bg-white rounded-2xl border border-[#eaedff] shadow-xs">
        {daysOfWeek.map((d) => {
          const isSelected = selectedDay === d.date;
          return (
            <button
              key={d.date}
              onClick={() => setSelectedDay(d.date)}
              className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                isSelected
                  ? 'bg-[#3525cd] text-white shadow-sm'
                  : d.isToday
                  ? 'bg-[#eaedff] text-[#3525cd] font-semibold'
                  : 'text-[#464555] hover:bg-[#f2f3ff]'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold">{d.day}</span>
              <span className="text-[16px] font-bold mt-0.5">{d.date}</span>
              {d.isToday && (
                <span
                  className={`w-1 h-1 rounded-full mt-1 ${
                    isSelected ? 'bg-white' : 'bg-[#3525cd]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Time Blocks Timeline */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[12px] text-[#464555] px-1">
          <span className="font-semibold">Timeline</span>
          <span className="flex items-center gap-1 text-[#00668a]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Calendar Sync
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {timeBlocks.map((block, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-[12px] font-medium text-[#777587] w-16 pt-2 shrink-0 tabular-nums">
                {block.time}
              </span>

              <div
                onClick={() => {
                  if (block.event.taskId) {
                    const found = tasks.find((t) => t.id === block.event.taskId);
                    if (found) onSelectTask(found);
                  }
                }}
                className={`flex-1 p-3 rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md ${block.event.color}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-bold text-[#131b2e] leading-snug">
                    {block.event.title}
                  </span>
                  {block.event.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#6b00b7] shadow-xs shrink-0">
                      {block.event.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#464555]">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>{block.event.duration}</span>
                  <span>•</span>
                  <span>{block.event.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
