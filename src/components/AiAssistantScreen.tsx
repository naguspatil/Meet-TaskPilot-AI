import React, { useState, useRef, useEffect } from 'react';
import { Task, CopilotMessage } from '../types';

interface AiAssistantScreenProps {
  tasks: Task[];
  messages: CopilotMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onAddTask: (newTask: Partial<Task>) => void;
  onClearSession: () => void;
  onOpenAddTask: () => void;
}

export const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({
  tasks,
  messages,
  onSendMessage,
  onAddTask,
  onClearSession,
  onOpenAddTask,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [scheduledBlocks, setScheduledBlocks] = useState<Record<string, boolean>>({});
  const [addedBreakdowns, setAddedBreakdowns] = useState<Record<string, boolean>>({});
  const [checkedSubtasks, setCheckedSubtasks] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setInputText('');
    setIsTyping(true);
    try {
      await onSendMessage(text.trim());
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setInputText('What are my top 3 priorities for today?');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsVoiceActive(true);
      recognition.onend = () => setIsVoiceActive(false);
      recognition.onresult = (evt: any) => {
        const transcript = evt.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript);
      };
      recognition.start();
    } catch {
      setInputText('What are my top 3 priorities for today?');
    }
  };

  const handleScheduleBlock = (msgId: string) => {
    setScheduledBlocks((prev) => ({ ...prev, [msgId]: true }));
  };

  const handleAddAllSubtasks = (msgId: string, breakdown: any) => {
    setAddedBreakdowns((prev) => ({ ...prev, [msgId]: true }));
    if (breakdown?.subtasks) {
      breakdown.subtasks.forEach((st: any) => {
        setCheckedSubtasks((prev) => ({ ...prev, [`${msgId}-${st.id}`]: true }));
      });
      // Optionally link to the task in state
      onAddTask({
        title: breakdown.taskTitle,
        category: 'Work',
        priority: 'high',
        date: 'Today, Oct 24',
        time: '4:00 PM',
        subtasks: breakdown.subtasks.map((st: any) => ({
          id: st.id,
          title: st.title,
          est: st.est,
          completed: false,
        })),
      });
    }
  };

  const toggleSubtaskCheck = (key: string) => {
    setCheckedSubtasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const suggestionChips = [
    { label: 'What should I focus on today?', icon: 'explore', color: 'text-[#3525cd]' },
    { label: 'Move unfinished tasks to tomorrow', icon: 'next_plan', color: 'text-[#6b00b7]' },
    { label: 'Show highest priority tasks', icon: 'priority_high', color: 'text-[#ba1a1a]' },
    { label: 'Plan my afternoon schedule', icon: 'schedule', color: 'text-[#00668a]' },
  ];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-44 pt-20">
      {/* Sticky Copilot Subheader / Status Bar */}
      <div className="sticky top-20 z-30 flex items-center justify-between px-4 py-2.5 bg-[#faf8ff]/90 backdrop-blur-md border-b border-[#eaedff]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#e2dfff] text-[#3525cd]">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#40c2fd] ring-2 ring-[#faf8ff]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-[#131b2e]">TaskAI Copilot</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#f0dbff] text-[#2c0051]">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[11px] text-[#464555]">Active • Synced with Calendar</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClearSession}
            title="Restart session"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          </button>
          <button
            onClick={() => alert('Copilot Settings: Natural Language parsing is active.')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>
      </div>

      {/* Suggestion Quick Pills (Horizontal Scroller) */}
      <div className="w-full overflow-x-auto no-scrollbar py-2.5 px-4 flex items-center gap-2">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.label)}
            className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] active:scale-95 transition-all text-[#131b2e] flex items-center gap-1.5 text-left shadow-xs border border-[#dae2fd]/60"
          >
            <span className={`material-symbols-outlined text-[16px] ${chip.color}`}>{chip.icon}</span>
            <span className="text-[12px] font-medium">{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex flex-col px-4 py-2 gap-4 w-full">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex flex-col items-end gap-1 ml-auto max-w-[85%]">
                <div className="bg-[#4f46e5] text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-[0_4px_16px_-4px_rgba(79,70,229,0.35)]">
                  <p className="text-[14px] text-white leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[11px] text-[#464555] pr-1">{msg.timestamp}</span>
              </div>
            );
          }

          // AI Message
          const breakdown = msg.breakdown;
          const subtasks = breakdown?.subtasks || [];
          const checkedCount = subtasks.filter(
            (st) => checkedSubtasks[`${msg.id}-${st.id}`]
          ).length;
          const totalSubtasks = subtasks.length;
          const isAllChecked = addedBreakdowns[msg.id] || (totalSubtasks > 0 && checkedCount === totalSubtasks);
          const isScheduled = scheduledBlocks[msg.id];

          return (
            <div key={msg.id} className="flex items-start gap-2.5 w-full">
              {/* Sparkle Avatar */}
              <div className="shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#3525cd] to-[#6b00b7] flex items-center justify-center text-white shadow-[0_4px_14px_rgba(107,0,183,0.35)]">
                <span className="material-symbols-outlined text-[20px] material-symbols-fill">
                  auto_awesome
                </span>
              </div>

              {/* AI Content Stream */}
              <div className="flex flex-col gap-3 w-full min-w-0">
                {/* Introductory Text Bubble */}
                <div className="bg-white text-[#131b2e] p-4 rounded-2xl rounded-tl-xs shadow-[0_2px_12px_rgba(15,23,42,0.05)] border border-[#eaedff]">
                  <p className="text-[14px] leading-relaxed text-[#131b2e] whitespace-pre-line">
                    {msg.text}
                  </p>
                </div>

                {/* Embedded Interactive Task Card 1 (if available) */}
                {msg.recommendedTask && (
                  <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(79,70,229,0.08)] border border-[#eaedff] relative overflow-hidden transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ba1a1a] rounded-r-full" />
                    <div className="flex items-start justify-between gap-2 pl-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          onClick={() => {
                            if (msg.recommendedTask?.id) {
                              const t = tasks.find((tk) => tk.id === msg.recommendedTask?.id);
                              if (t) t.completed = !t.completed;
                            }
                          }}
                          className="mt-0.5 w-5 h-5 rounded-md bg-[#eaedff] flex items-center justify-center text-[#3525cd] hover:bg-[#e2dfff] active:scale-90 transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-semibold text-[#131b2e] truncate">
                            {msg.recommendedTask.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffdad6] text-[#93000a] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                              {msg.recommendedTask.priority}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#eaedff] text-[#464555] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              {msg.recommendedTask.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={onOpenAddTask}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#464555] hover:bg-[#eaedff]"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>
                    </div>

                    <div className="mt-3 pt-3 flex items-start gap-2 bg-[#f2f3ff] p-2.5 rounded-xl border border-[#eaedff]">
                      <span className="material-symbols-outlined text-[16px] text-[#6b00b7] mt-0.5">
                        psychology
                      </span>
                      <p className="text-[12px] text-[#464555] leading-relaxed">
                        <strong className="text-[#131b2e] font-semibold">Why first:</strong>{' '}
                        {msg.recommendedTask.whyFirst}
                      </p>
                    </div>
                  </div>
                )}

                {/* Embedded Subtask Breakdown Card */}
                {breakdown && (
                  <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(107,0,183,0.1)] border border-[#eaedff] relative overflow-hidden">
                    {/* Sparkle Gradient Strip */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3525cd] via-[#6b00b7] to-[#40c2fd]" />

                    <div className="flex items-center justify-between pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#f0dbff] text-[#6b00b7] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">checklist</span>
                        </div>
                        <span className="text-[13px] font-bold text-[#131b2e]">
                          ✨ AI Breakdown: {breakdown.taskTitle}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#6b00b7] bg-[#f0dbff]/60 px-2 py-0.5 rounded-full tabular-nums">
                        {checkedCount}/{totalSubtasks} subtasks
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-[#3525cd] to-[#6b00b7] transition-all duration-300"
                        style={{
                          width: `${totalSubtasks > 0 ? (checkedCount / totalSubtasks) * 100 : 0}%`,
                        }}
                      />
                    </div>

                    {/* Subtask list */}
                    <div className="flex flex-col gap-2">
                      {subtasks.map((st) => {
                        const key = `${msg.id}-${st.id}`;
                        const isChecked = checkedSubtasks[key] || false;
                        return (
                          <label
                            key={st.id}
                            className="group flex items-center justify-between p-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] cursor-pointer transition-colors border border-[#eaedff]/60"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSubtaskCheck(key)}
                                className="w-4 h-4 rounded text-[#3525cd] focus:ring-0 cursor-pointer accent-[#3525cd]"
                              />
                              <span
                                className={`text-[12px] transition-colors ${
                                  isChecked
                                    ? 'line-through text-[#777587]'
                                    : 'text-[#131b2e] group-hover:text-[#3525cd]'
                                }`}
                              >
                                {st.title}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#464555] bg-[#dae2fd] px-2 py-0.5 rounded-md shrink-0">
                              {st.est}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Add all button */}
                    <button
                      onClick={() => handleAddAllSubtasks(msg.id, breakdown)}
                      className={`mt-3 w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        isAllChecked
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#e2dfff] text-[#3525cd] hover:bg-[#3525cd] hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isAllChecked ? 'done_all' : 'playlist_add'}
                      </span>
                      <span>
                        {isAllChecked ? 'All subtasks synced!' : `Add all subtasks to task (+${totalSubtasks})`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Calendar proposal */}
                {msg.calendarProposal && (
                  <div className="bg-white text-[#131b2e] p-4 rounded-2xl shadow-[0_2px_12px_rgba(15,23,42,0.05)] border border-[#eaedff] flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-[#3525cd] mt-0.5">
                        event_upcoming
                      </span>
                      <p className="text-[13px] text-[#131b2e] leading-relaxed">
                        Would you like me to block{' '}
                        <strong className="text-[#131b2e] font-bold">
                          {msg.calendarProposal.startTime} – {msg.calendarProposal.endTime}
                        </strong>{' '}
                        on your calendar for this deep work block?
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleScheduleBlock(msg.id)}
                        className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(79,70,229,0.2)] active:scale-95 transition-all ${
                          isScheduled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#4f46e5] text-white hover:bg-[#3525cd]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isScheduled ? 'check_circle' : 'event_available'}
                        </span>
                        <span>
                          {isScheduled
                            ? `Scheduled (${msg.calendarProposal.startTime}-${msg.calendarProposal.endTime})`
                            : 'Yes, schedule deep work'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleSend('What else is on my schedule today?')}
                        className="px-3.5 py-2 rounded-xl bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] text-[12px] font-medium active:scale-95 transition-all"
                      >
                        Ask another question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-[#464555] text-[13px] py-2 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#3525cd] to-[#6b00b7] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            </div>
            <span>TaskAI is processing your schedule...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persistent Bottom AI Chat Input Bar */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2 pt-2 bg-gradient-to-t from-[#faf8ff] via-[#faf8ff]/95 to-transparent">
        <div className="max-w-md mx-auto flex items-center gap-2 bg-white p-1.5 pl-3 rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.12)] border border-[#eaedff]">
          {/* Add context button */}
          <button
            onClick={onOpenAddTask}
            aria-label="Add task from chat"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#464555] hover:text-[#3525cd] hover:bg-[#eaedff] active:scale-90 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>

          {/* Input field */}
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask TaskAI anything or give a command..."
            className="w-full bg-transparent border-0 text-[#131b2e] placeholder:text-[#777587] text-[13px] focus:outline-none min-w-0"
          />

          {/* Dictation Mic Button with pulse */}
          <button
            onClick={handleVoiceToggle}
            aria-label="Voice input"
            className={`relative w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all shrink-0 ${
              isVoiceActive
                ? 'text-[#6b00b7] bg-[#f0dbff]'
                : 'text-[#464555] hover:text-[#6b00b7] hover:bg-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
            {isVoiceActive && (
              <span className="absolute inset-0 rounded-full bg-[#6b00b7]/25 animate-ping" />
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3525cd] to-[#6b00b7] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(79,70,229,0.3)] hover:brightness-110 active:scale-90 transition-all shrink-0 disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
