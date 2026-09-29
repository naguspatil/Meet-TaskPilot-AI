import React from 'react';
import { TASK_AI_LOGO, USER_PROFILE } from '../data/initialData';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onAskAiClick?: () => void;
  onProfileClick?: () => void;
  currentTime?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  onAskAiClick,
  onProfileClick,
  currentTime = '9:41',
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-[#eaedff]/60">
      {/* iOS/Android Status Bar */}
      <div className="h-6 px-4 flex items-center justify-between text-[#131b2e] pt-1">
        <span className="text-[12px] font-semibold tracking-tight tabular-nums">{currentTime}</span>
        <div className="flex items-center gap-1.5 text-[#131b2e]">
          <span className="material-symbols-outlined text-[15px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[15px]">wifi</span>
          <span className="material-symbols-outlined text-[17px]">battery_full</span>
        </div>
      </div>

      {/* Main Top App Bar */}
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-1.5 flex items-center justify-center rounded-full hover:bg-[#eaedff] active:scale-95 transition-all text-[#131b2e]"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : null}

          {/* Logo or Title */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={TASK_AI_LOGO}
              alt="TaskAI Logo"
              className="h-7 w-auto object-contain rounded-md shrink-0 shadow-xs"
              onError={(e) => {
                // Inline SVG fallback if network blocked
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {title ? (
              <h1 className="text-[18px] font-semibold text-[#131b2e] truncate">{title}</h1>
            ) : (
              <span className="text-[20px] font-bold tracking-tight text-[#131b2e]">TaskAI</span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!showBack && onAskAiClick && (
            <button
              onClick={onAskAiClick}
              className="h-9 px-3 bg-[#e2dfff] text-[#3525cd] flex items-center gap-1.5 rounded-full shadow-[0_2px_8px_-2px_rgba(79,70,229,0.15)] hover:bg-[#4f46e5] hover:text-white transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span className="text-[13px] font-semibold">Ask AI</span>
            </button>
          )}

          <button
            onClick={onProfileClick}
            aria-label="View Profile"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#eaedff] active:scale-95 transition-transform"
          >
            <img
              src={USER_PROFILE.avatarUrl}
              alt={USER_PROFILE.fullName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e2dfff]"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
