import React from 'react';
import { Task } from '../types';

interface AnalyticsScreenProps {
  tasks: Task[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ tasks }) => {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const highPriorityCompleted = tasks.filter(
    (t) => t.completed && t.priority === 'high'
  ).length;

  const categories = [
    { name: 'Work', count: tasks.filter((t) => t.category === 'Work').length, color: 'bg-[#3525cd]' },
    { name: 'Product', count: tasks.filter((t) => t.category === 'Product').length, color: 'bg-[#00668a]' },
    { name: 'Personal', count: tasks.filter((t) => t.category === 'Personal').length, color: 'bg-emerald-500' },
    { name: 'Health', count: tasks.filter((t) => t.category === 'Health').length, color: 'bg-[#862dd4]' },
  ];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-36 pt-22 gap-5">
      <div>
        <h2 className="text-[22px] font-bold text-[#131b2e]">Productivity Velocity</h2>
        <p className="text-[13px] text-[#464555]">
          Your cognitive efficiency and focus metrics this week
        </p>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#464555]">
            <span className="text-[12px] font-semibold">Weekly Velocity</span>
            <span className="text-emerald-600 font-bold text-[12px]">+18%</span>
          </div>
          <div className="mt-2">
            <span className="text-[28px] font-bold text-[#131b2e]">4.8 hrs</span>
            <p className="text-[11px] text-[#464555]">Avg. daily deep focus</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#eaedff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#464555]">
            <span className="text-[12px] font-semibold">Completion Rate</span>
            <span className="text-[#3525cd] font-bold text-[12px]">Top 5%</span>
          </div>
          <div className="mt-2">
            <span className="text-[28px] font-bold text-[#131b2e]">
              {Math.round((completedCount / (totalCount || 1)) * 100)}%
            </span>
            <p className="text-[11px] text-[#464555]">{completedCount} tasks completed</p>
          </div>
        </div>
      </div>

      {/* Focus Breakdown Bento Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#eaedff] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#131b2e]">Category Distribution</h3>
          <span className="text-[12px] text-[#6b00b7] font-semibold">AI Optimized</span>
        </div>

        <div className="flex h-3 rounded-full overflow-hidden gap-1 bg-[#eaedff]">
          {categories.map((cat, i) => (
            <div
              key={i}
              className={`h-full ${cat.color}`}
              style={{ width: `${(cat.count / (totalCount || 1)) * 100}%` }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[#f2f3ff]">
              <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
              <span className="text-[12px] font-medium text-[#131b2e]">{cat.name}</span>
              <span className="text-[12px] text-[#464555] ml-auto font-bold">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cognitive Load Optimization Insights */}
      <div className="bg-gradient-to-br from-[#eaedff] via-white to-[#f0dbff] rounded-2xl p-4 border border-[#dae2fd] shadow-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#6b00b7]">
          <span className="material-symbols-outlined text-[18px]">neurology</span>
          <span className="text-[13px] font-bold">Cognitive Load Pattern</span>
        </div>
        <p className="text-[13px] text-[#131b2e] leading-relaxed">
          Sarah, your peak cognitive clarity occurs between <strong>9:30 AM – 11:30 AM</strong>.
          TaskAI automatically scheduled your High Priority Q3 deliverables during this peak window.
        </p>
      </div>
    </div>
  );
};
