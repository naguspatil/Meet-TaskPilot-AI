import React, { useState } from 'react';
import { Task } from '../types';

interface TodayScreenProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onAddTaskClick: () => void;
  onRescheduleOverdue: (taskId: string) => void;
  onQuickAiPrompt: (prompt: string) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  tasks,
  onToggleTask,
  onSelectTask,
  onAddTaskClick,
  onRescheduleOverdue,
  onQuickAiPrompt,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isCopilotDismissed, setIsCopilotDismissed] = useState<boolean>(false);
  const [isPlanAccepted, setIsPlanAccepted] = useState<boolean>(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState<boolean>(true);
  const [sortByPriority, setSortByPriority] = useState<boolean>(true);
  const [quickInput, setQuickInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);

  // Split tasks into Overdue, Today (Active), and Completed
  const overdueTasks = tasks.filter((t) => t.status === 'overdue' && !t.completed);
  const activeTodayTasks = tasks.filter((t) => t.status === 'today' && !t.completed);
  const completedTasks = tasks.filter((t) => t.completed || t.status === 'completed');

  // Filter today tasks
  const filteredTodayTasks = activeTodayTasks.filter((task) => {
    if (selectedFilter === 'high') return task.priority === 'high';
    if (selectedFilter === 'work') return task.category === 'Work';
    if (selectedFilter === 'personal') return task.category === 'Personal';
    if (selectedFilter === 'product') return task.category === 'Product';
    return true;
  });

  // Sort today tasks
  const sortedTasks = [...filteredTodayTasks].sort((a, b) => {
    if (!sortByPriority) return 0;
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onQuickAiPrompt(quickInput.trim());
      setQuickInput('');
    }
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setQuickInput('Remind me to finalize Q3 deck tomorrow at 2 PM');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuickInput(transcript);
        onQuickAiPrompt(transcript);
      };
      recognition.start();
    } catch {
      setQuickInput('Remind me to review budget tomorrow with high priority');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-36 pt-22 gap-5">
      {/* Top Greeting & Weather Row */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-[#131b2e] tracking-tight flex items-center gap-2">
            Good morning, Sarah
            <span className="inline-block hover:rotate-12 transition-transform cursor-pointer origin-bottom-right">
              👋
            </span>
          </h1>

          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              aria-label="Notifications"
              className="w-9 h-9 rounded-full bg-[#eaedff] flex items-center justify-center text-[#464555] hover:text-[#3525cd] active:scale-95 transition-all relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-11 w-64 p-3 bg-white rounded-2xl shadow-xl border border-[#eaedff] z-50 animate-in fade-in zoom-in-95">
                <div className="text-[12px] font-semibold text-[#131b2e] mb-1">Notifications</div>
                <div className="text-[11px] text-[#464555] leading-relaxed">
                  ⚠️ Executive sync at 2:00 PM with Elena V. Prepare Q3 numbers beforehand.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#464555] text-[13px]">
          <span>Thursday, Oct 24</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#00668a]">
            <span className="material-symbols-outlined text-[16px] text-amber-500">wb_sunny</span>
            Sunny 21°C
          </span>
        </div>
      </div>

      {/* Daily Progress Bento Card */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.06)] border border-[#eaedff]/70 flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#e2dfff]/30 blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#464555] uppercase tracking-wider">
              Today's Progress
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[26px] font-bold text-[#131b2e] tabular-nums">
                {completedCount} of {totalTasks}
              </span>
              <span className="text-[14px] text-[#464555]">tasks done</span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#e2dfff] text-[#3525cd] text-[12px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">auto_graph</span>
            <span>{completionPercentage}%</span>
          </div>
        </div>

        {/* Progress Track with Gradient Fill */}
        <div className="w-full h-3 bg-[#e2e7ff] rounded-full overflow-hidden p-0.5 relative z-10">
          <div
            className="h-full bg-gradient-to-r from-[#3525cd] via-[#4f46e5] to-[#6b00b7] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Quick Stat Badges */}
        <div className="flex items-center gap-2 pt-0.5 relative z-10 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eaedff] text-[12px] text-[#131b2e] font-medium">
            <span className="text-[14px]">🔥</span>
            <span>
              <strong className="font-semibold text-[#3525cd]">5 Day</strong> Streak
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffdad6]/60 text-[12px] text-[#93000a] font-medium">
            <span className="text-[14px]">⚡</span>
            <span>
              <strong className="font-semibold">{highPriorityCount} High</strong> Priority
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1 text-[#464555] text-[11px]">
            <span className="material-symbols-outlined text-[15px] text-[#6b00b7]">pace</span>
            <span>+18% velocity</span>
          </div>
        </div>
      </div>

      {/* AI Productivity Suggestion Card (Hero AI Copilot) */}
      {!isCopilotDismissed && (
        <div className="w-full relative rounded-2xl p-[1.5px] bg-gradient-to-br from-[#6b00b7] via-[#4f46e5] to-[#40c2fd] shadow-[0_8px_24px_-4px_rgba(107,0,183,0.12)] transition-all">
          <div className="w-full h-full bg-white/95 backdrop-blur-xl rounded-[15px] p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0dbff] text-[#2c0051] text-[11px] font-semibold tracking-wide">
                <span className="material-symbols-outlined text-[15px] text-[#6b00b7]">smart_toy</span>
                <span>TaskAI Copilot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-ping" />
                <span className="text-[11px] text-[#464555] font-medium">Optimized plan</span>
              </div>
            </div>

            <p className="text-[14px] text-[#131b2e] leading-relaxed mt-0.5">
              “You have <span className="font-semibold text-[#3525cd]">3 critical deadlines</span> today. Consider finalizing the{' '}
              <span className="font-semibold text-[#131b2e]">Q3 Financial Report</span> before your 2:00 PM sync while focus energy is peak.”
            </p>

            {/* Action Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => {
                  setIsPlanAccepted(true);
                  setSortByPriority(true);
                }}
                className={`h-8 px-3.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(79,70,229,0.25)] transition-all active:scale-95 ${
                  isPlanAccepted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#3525cd] text-white hover:brightness-105'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isPlanAccepted ? 'done_all' : 'check_circle'}
                </span>
                <span>{isPlanAccepted ? 'Plan Prioritized!' : 'Accept plan'}</span>
              </button>

              <button
                onClick={() => {
                  alert('Rescheduling sync with Elena V. proposed for 3:30 PM.');
                }}
                className="h-8 px-3 bg-[#eaedff] text-[#131b2e] text-[12px] font-medium rounded-full hover:bg-[#e2e7ff] active:scale-95 transition-all"
              >
                Reschedule sync
              </button>

              <button
                onClick={() => setIsCopilotDismissed(true)}
                className="h-8 px-2.5 text-[#464555] text-[12px] hover:text-[#131b2e] active:scale-95 transition-all ml-auto"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick AI Natural Language Prompt Dock */}
      <form
        onSubmit={handleQuickSubmit}
        className="w-full bg-[#f2f3ff] rounded-2xl p-2 pl-4 flex items-center gap-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#eaedff] focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(79,70,229,0.1)] transition-all"
      >
        <span className="material-symbols-outlined text-[#3525cd] text-[20px]">auto_awesome</span>
        <input
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Ask AI or tap mic to log anything..."
          className="bg-transparent text-[14px] text-[#131b2e] placeholder:text-[#777587] focus:outline-none w-full min-w-0"
        />
        <button
          type="button"
          onClick={handleVoiceToggle}
          aria-label="Voice input"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-90 ${
            isListening
              ? 'bg-[#ba1a1a] text-white animate-pulse'
              : 'bg-[#6b00b7] text-white shadow-[0_2px_8px_rgba(107,0,183,0.3)] hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isListening ? 'mic' : 'graphic_eq'}
          </span>
        </button>
      </form>

      {/* Filter Chip Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`h-8 px-4 rounded-full text-[12px] font-semibold shrink-0 transition-all ${
            selectedFilter === 'all'
              ? 'bg-[#3525cd] text-white shadow-[0_2px_8px_rgba(53,37,205,0.2)]'
              : 'bg-[#eaedff] text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          All ({totalTasks})
        </button>

        <button
          onClick={() => setSelectedFilter('high')}
          className={`h-8 px-4 rounded-full text-[12px] font-semibold shrink-0 transition-all ${
            selectedFilter === 'high'
              ? 'bg-[#3525cd] text-white shadow-[0_2px_8px_rgba(53,37,205,0.2)]'
              : 'bg-[#eaedff] text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          ⚡ High Priority ({tasks.filter((t) => t.priority === 'high').length})
        </button>

        <button
          onClick={() => setSelectedFilter('work')}
          className={`h-8 px-4 rounded-full text-[12px] font-semibold shrink-0 transition-all ${
            selectedFilter === 'work'
              ? 'bg-[#3525cd] text-white shadow-[0_2px_8px_rgba(53,37,205,0.2)]'
              : 'bg-[#eaedff] text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          💼 Work ({tasks.filter((t) => t.category === 'Work').length})
        </button>

        <button
          onClick={() => setSelectedFilter('personal')}
          className={`h-8 px-4 rounded-full text-[12px] font-semibold shrink-0 transition-all ${
            selectedFilter === 'personal'
              ? 'bg-[#3525cd] text-white shadow-[0_2px_8px_rgba(53,37,205,0.2)]'
              : 'bg-[#eaedff] text-[#464555] hover:text-[#131b2e]'
          }`}
        >
          🛒 Personal ({tasks.filter((t) => t.category === 'Personal').length})
        </button>
      </div>

      {/* SECTION: Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-pulse" />
              <h2 className="text-[16px] font-bold text-[#ba1a1a] tracking-tight">Overdue</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold">
                {overdueTasks.length}
              </span>
            </div>
            <span className="text-[12px] text-[#464555]">Action needed</span>
          </div>

          {overdueTasks.map((task) => (
            <div
              key={task.id}
              className="w-full bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(186,26,26,0.06)] border border-[#ffdad6]/60 flex flex-col gap-2 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ba1a1a] rounded-l-2xl" />

              <div className="flex items-start gap-3 pl-2">
                <button
                  onClick={() => onToggleTask(task.id)}
                  aria-label="Toggle overdue task"
                  className="w-6 h-6 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-transparent hover:text-white hover:bg-[#3525cd] transition-all shrink-0 mt-0.5 active:scale-90"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>

                <div
                  onClick={() => onSelectTask(task)}
                  className="flex flex-col min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-[#131b2e] truncate">
                      {task.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold shrink-0">
                      Overdue
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#ba1a1a] text-[12px] mt-1">
                    <span className="material-symbols-outlined text-[15px]">event_busy</span>
                    <span>{task.date}</span>
                  </div>
                </div>
              </div>

              {/* Quick AI Resolution Suggestion inside Overdue card */}
              <div className="ml-8 mt-1 p-2.5 rounded-xl bg-[#f0dbff]/40 flex items-center justify-between gap-2 border border-[#f0dbff]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[#6b00b7] text-[17px] shrink-0">
                    auto_fix_high
                  </span>
                  <span className="text-[12px] text-[#131b2e] font-medium truncate">
                    Auto-reschedule to today at 4 PM?
                  </span>
                </div>
                <button
                  onClick={() => onRescheduleOverdue(task.id)}
                  className="px-2.5 py-1 bg-[#6b00b7] text-white rounded-lg text-[11px] font-medium hover:brightness-110 active:scale-95 transition-all shrink-0"
                >
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION: Today Tasks */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-[#131b2e] tracking-tight">Today</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#3525cd] text-[11px] font-bold">
              {sortedTasks.length}
            </span>
          </div>

          <button
            onClick={() => setSortByPriority(!sortByPriority)}
            className="text-[#3525cd] text-[12px] font-medium hover:underline flex items-center gap-0.5"
          >
            <span>{sortByPriority ? 'Sorted by priority' : 'Default sort'}</span>
            <span className="material-symbols-outlined text-[16px]">swap_vert</span>
          </button>
        </div>

        {sortedTasks.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-[#eaedff]">
            <span className="material-symbols-outlined text-4xl text-[#777587]">task</span>
            <p className="text-[13px] text-[#464555] mt-1">No tasks matching this filter.</p>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const priorityBorderColor =
              task.priority === 'high'
                ? 'bg-[#ba1a1a]'
                : task.priority === 'medium'
                ? 'bg-amber-500'
                : 'bg-emerald-500';

            const priorityBadge =
              task.priority === 'high' ? (
                <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold shrink-0">
                  High Priority
                </span>
              ) : task.priority === 'medium' ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-semibold shrink-0">
                  Medium
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-semibold shrink-0">
                  Low
                </span>
              );

            const completedSubtasksCount =
              task.subtasks?.filter((s) => s.completed).length || 0;
            const totalSubtasksCount = task.subtasks?.length || 0;

            return (
              <div
                key={task.id}
                className="w-full bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#eaedff]/70 flex flex-col gap-2 relative overflow-hidden transition-all hover:shadow-md"
              >
                {/* Priority Accent Indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityBorderColor} rounded-l-2xl`} />

                <div className="flex items-start gap-3 pl-2">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    aria-label={`Complete task ${task.title}`}
                    className="w-6 h-6 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-transparent hover:text-white hover:bg-[#3525cd] transition-all shrink-0 mt-0.5 active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>

                  <div
                    onClick={() => onSelectTask(task)}
                    className="flex flex-col min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-semibold text-[#131b2e] line-clamp-1">
                        {task.title}
                      </span>
                      {priorityBadge}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-1.5 text-[12px] text-[#464555]">
                      <span
                        className={`flex items-center gap-1 ${
                          task.priority === 'high' ? 'text-[#ba1a1a] font-medium' : ''
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {task.timeLeft ? 'timer' : 'schedule'}
                        </span>
                        <span>
                          {task.time} {task.timeLeft ? `• ${task.timeLeft}` : ''}
                        </span>
                      </span>

                      <span>•</span>

                      <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[11px] font-medium text-[#464555]">
                        {task.category === 'Work' && '💼 '}
                        {task.category === 'Product' && '🎨 '}
                        {task.category === 'Personal' && '🛒 '}
                        {task.category === 'Health' && '❤️ '}
                        {task.category}
                      </span>

                      {totalSubtasksCount > 0 && (
                        <span className="flex items-center gap-1 text-[11px] ml-auto text-[#464555]">
                          <span className="material-symbols-outlined text-[15px]">checklist</span>
                          <span>
                            {completedSubtasksCount}/{totalSubtasksCount} subtasks
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Collaborator Tag if present */}
                    {task.sharedWith && (
                      <div className="mt-2.5 pt-2 flex items-center justify-between bg-[#f2f3ff]/70 rounded-xl px-2.5 py-1.5 border border-[#eaedff]">
                        <div className="flex items-center gap-2">
                          <img
                            src={task.sharedWith.avatarUrl}
                            alt={task.sharedWith.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                          />
                          <span className="text-[11px] text-[#464555]">
                            Shared with {task.sharedWith.name}
                          </span>
                        </div>
                        <span className="text-[#3525cd] text-[11px] font-semibold">
                          AI Briefing ready
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SECTION: Completed Tasks Accordion */}
      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={() => setIsCompletedOpen(!isCompletedOpen)}
            className="w-full flex items-center justify-between py-2 px-1 text-[#464555] hover:text-[#131b2e] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">
                task_alt
              </span>
              <h2 className="text-[16px] text-[#131b2e] font-semibold">Completed</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[11px] font-medium">
                {completedTasks.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold animate-pulse">
                Great job! 🎉
              </span>
            </div>

            <span
              className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${
                isCompletedOpen ? 'rotate-0' : '-rotate-90'
              }`}
            >
              expand_more
            </span>
          </button>

          {isCompletedOpen && (
            <div className="flex flex-col gap-1.5 opacity-90 transition-all">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="w-full bg-[#f2f3ff]/70 rounded-xl p-3 flex items-center gap-3 border border-[#eaedff]/60"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    aria-label={`Uncheck ${task.title}`}
                    className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[16px]">done</span>
                  </button>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] text-[#464555] line-through truncate">
                      {task.title}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#777587] shrink-0">
                    {task.completedAt || task.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (+ New Task) */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={onAddTaskClick}
          className="min-h-[48px] h-14 px-4 bg-[#4f46e5] text-white flex items-center gap-2 rounded-[20px] shadow-[0_12px_32px_-6px_rgba(79,70,229,0.35)] hover:brightness-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
          <span className="text-[14px] font-semibold">New Task</span>
        </button>
      </div>
    </div>
  );
};
