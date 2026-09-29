import React from 'react';
import { USER_PROFILE } from '../data/initialData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#faf8ff] rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 shadow-2xl border border-[#eaedff] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Grab bar on mobile */}
        <div className="w-10 h-1 bg-[#c7c4d8] rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
          <h3 className="text-[18px] font-bold text-[#131b2e]">Profile & AI Preferences</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-[#eaedff] shadow-xs">
          <img
            src={USER_PROFILE.avatarUrl}
            alt={USER_PROFILE.fullName}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#3525cd]"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-bold text-[#131b2e]">{USER_PROFILE.fullName}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0dbff] text-[#2c0051]">
                PRO
              </span>
            </div>
            <span className="text-[12px] text-[#464555]">{USER_PROFILE.role}</span>
            <span className="text-[11px] text-[#777587] truncate">{USER_PROFILE.email}</span>
          </div>
        </div>

        {/* AI Capabilities Settings */}
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-[#464555] uppercase tracking-wider">
            AI Assistant Controls
          </span>

          <div className="bg-white rounded-2xl p-3 border border-[#eaedff] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">
                  auto_awesome
                </span>
                <span className="text-[13px] font-semibold text-[#131b2e]">
                  Auto-reschedule overdue tasks
                </span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-[#3525cd]" />
            </div>

            <div className="flex items-center justify-between border-t border-[#eaedff] pt-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#6b00b7]">
                  insights
                </span>
                <span className="text-[13px] font-semibold text-[#131b2e]">
                  Subtask decomposition (V3.5)
                </span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-[#3525cd]" />
            </div>

            <div className="flex items-center justify-between border-t border-[#eaedff] pt-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#00668a]">
                  sync_alt
                </span>
                <span className="text-[13px] font-semibold text-[#131b2e]">
                  Google Calendar Bi-directional Sync
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#3525cd] text-white text-[13px] font-semibold rounded-full hover:opacity-95 active:scale-95 transition-all mt-2"
        >
          Done
        </button>
      </div>
    </div>
  );
};
