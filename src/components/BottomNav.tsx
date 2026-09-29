import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: TabType; label: string; icon: string; hasDot?: boolean }> = [
    { id: 'today', label: 'Today', icon: 'check_circle' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    { id: 'ai-assistant', label: 'TaskAI', icon: 'smart_toy', hasDot: true },
    { id: 'analytics', label: 'Analytics', icon: 'bar_chart' },
    { id: 'profile', label: 'Profile', icon: 'account_circle' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#faf8ff]/92 backdrop-blur-xl border-t border-[#eaedff]/70 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-lg mx-auto h-18 px-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-all group relative ${
                isActive ? 'text-[#3525cd] font-semibold' : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <div
                className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#e2dfff] text-[#3525cd] shadow-xs'
                    : 'text-[#464555] group-hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
              </div>

              {tab.hasDot && (
                <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-[#6b00b7] shadow-[0_0_8px_rgba(107,0,183,0.7)]" />
              )}

              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android/iOS Gesture Navigation Pill Indicator */}
      <div className="w-full flex justify-center pb-2 pt-0.5">
        <div className="w-32 h-1 bg-[#131b2e]/20 rounded-full" />
      </div>
    </nav>
  );
};
