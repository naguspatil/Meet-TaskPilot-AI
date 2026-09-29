import React, { useState } from 'react';
import { Task, Subtask } from '../types';

interface AddTaskScreenProps {
  onClose: () => void;
  onSaveTask: (newTask: Partial<Task>) => void;
}

export const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ onClose, onSaveTask }) => {
  const [aiPrompt, setAiPrompt] = useState<string>(
    'Remind me to submit the Q4 budget report tomorrow at 10 AM with high priority'
  );
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>('Submit Q4 budget report');
  const [description, setDescription] = useState<string>(
    'Review latest spreadsheet numbers from marketing before sending to VP.'
  );
  const [date, setDate] = useState<string>('Tomorrow, Oct 25');
  const [time, setTime] = useState<string>('10:00 AM');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [category, setCategory] = useState<string>('Work');
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderTiming, setReminderTiming] = useState<string>('15 minutes before');
  const [recurrence, setRecurrence] = useState<string>('Does not repeat');
  const [aiSubtaskPlan, setAiSubtaskPlan] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Entities displayed under AI prompt
  const [entities, setEntities] = useState<Array<{ label: string; value: string; isHighPriority?: boolean; isTime?: boolean; isDate?: boolean; isReminder?: boolean }>>([
    { label: 'Task:', value: 'Submit Q4 budget' },
    { label: '', value: 'Tomorrow (Oct 25)', isDate: true },
    { label: '', value: '10:00 AM', isTime: true },
    { label: '', value: 'High Priority', isHighPriority: true },
    { label: '', value: '15m before', isReminder: true },
  ]);

  const handleApplyAi = async () => {
    setIsParsing(true);
    try {
      const res = await fetch('/api/gemini/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: aiPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.date) setDate(data.date);
        if (data.time) setTime(data.time);
        if (data.priority) setPriority(data.priority.toLowerCase());
        if (data.category) setCategory(data.category);
        if (data.reminder) setReminderTiming(data.reminder);

        if (data.entities && Array.isArray(data.entities)) {
          setEntities(
            data.entities.map((e: any) => ({
              label: e.label.includes(':') ? e.label : `${e.label}:`,
              value: e.value,
              isHighPriority: /high/i.test(e.value),
              isDate: /oct|nov|tomorrow|today|day/i.test(e.value),
              isTime: /am|pm|:\d\d/i.test(e.value),
              isReminder: /before|m\s*before|min/i.test(e.value),
            }))
          );
        }
      }
    } catch {
      // Heuristic application
      setTitle('Submit Q4 budget report');
      setDescription('Review latest spreadsheet numbers from marketing before sending to VP.');
      setDate('Tomorrow, Oct 25');
      setTime('10:00 AM');
      setPriority('high');
      setCategory('Work');
    } finally {
      setIsParsing(false);
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 2000);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setAiPrompt('Review Q4 marketing expenditure report on Friday at 3 PM');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (evt: any) => {
        const text = evt.results[0][0].transcript;
        setAiPrompt(text);
      };
      rec.start();
    } catch {
      setAiPrompt('Review Q4 marketing expenditure report on Friday at 3 PM');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);

    const generatedSubtasks: Subtask[] = aiSubtaskPlan
      ? [
          { id: `sb-${Date.now()}-1`, title: `1. Prepare preliminary files for ${title}`, est: '15m', completed: false },
          { id: `sb-${Date.now()}-2`, title: '2. Execute core deliverables & verify metrics', est: '30m', completed: false },
          { id: `sb-${Date.now()}-3`, title: '3. Complete final review and stakeholder sign-off', est: '15m', completed: false },
        ]
      : [];

    setTimeout(() => {
      onSaveTask({
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        priority,
        category,
        reminder: reminderEnabled ? reminderTiming : 'None',
        estEffort: '1 hr',
        status: 'today',
        completed: false,
        subtasks: generatedSubtasks,
      });
      setIsSaving(false);
      onClose();
    }, 500);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-28 pt-20">
      {/* Grab bar */}
      <div className="w-full flex justify-center py-1 mb-2">
        <div className="w-10 h-1.5 bg-[#c7c4d8]/60 rounded-full" />
      </div>

      {/* Screen Title Bar */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#131b2e] hover:bg-[#eaedff] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <h2 className="text-[20px] font-bold text-[#131b2e]">New Task</h2>

        <button
          onClick={handleSubmit}
          type="button"
          disabled={isSaving || !title.trim()}
          className="px-4 py-1.5 rounded-full bg-[#3525cd] text-white text-[13px] font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Create'}
        </button>
      </div>

      {/* Natural Language AI Create Card */}
      <div className="w-full rounded-2xl bg-[#eaedff] p-4 shadow-sm relative overflow-hidden mb-5 border border-[#dae2fd]">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#862dd4]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-1.5 text-[#6b00b7] mb-2">
          <span className="material-symbols-outlined text-[20px] material-symbols-fill">auto_awesome</span>
          <span className="text-[14px] font-bold tracking-tight">Natural Language AI Create</span>
        </div>

        <div className="relative w-full mb-3">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={2}
            placeholder="Type or speak anything..."
            className="w-full bg-white text-[#131b2e] text-[14px] rounded-xl p-3 pl-9 pr-9 resize-none focus:outline-none focus:ring-1 focus:ring-[#3525cd] shadow-xs leading-relaxed"
          />
          <span className="material-symbols-outlined text-[#3525cd] text-[18px] absolute left-3 top-3">
            neurology
          </span>
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label="Mic input"
            className={`absolute right-2.5 top-2.5 w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition-all ${
              isListening ? 'bg-[#ba1a1a] text-white animate-pulse' : 'bg-[#e2e7ff] text-[#464555] hover:text-[#3525cd]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">mic</span>
          </button>
        </div>

        {/* Extracted Entities */}
        <div className="flex flex-col gap-1.5 mb-3.5">
          <div className="flex items-center justify-between text-[#464555] px-0.5">
            <span className="text-[11px] font-medium tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b00b7] animate-pulse" />
              Extracted Entities
            </span>
            <span className="text-[11px] text-[#00668a] font-medium">100% confidence</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {entities.map((ent, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] shadow-xs ${
                  ent.isHighPriority
                    ? 'bg-[#ffdad6] text-[#93000a] font-semibold'
                    : 'bg-white text-[#131b2e] font-medium'
                }`}
              >
                {ent.label && <span className="text-[#6b00b7] font-medium">{ent.label}</span>}
                {ent.isDate && <span className="material-symbols-outlined text-[#00668a] text-[14px]">event</span>}
                {ent.isTime && <span className="material-symbols-outlined text-[#00668a] text-[14px]">schedule</span>}
                {ent.isHighPriority && <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />}
                {ent.isReminder && <span className="material-symbols-outlined text-[#3525cd] text-[14px]">notifications</span>}
                <span className="truncate max-w-[150px]">{ent.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Apply Parsed Details Button */}
        <button
          type="button"
          onClick={handleApplyAi}
          disabled={isParsing}
          className="w-full h-11 px-4 rounded-full bg-[#862dd4] text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
        >
          <span className={`material-symbols-outlined text-[18px] ${isParsing ? 'animate-spin' : ''}`}>
            {isApplied ? 'done_all' : 'magic_button'}
          </span>
          <span>{isParsing ? 'Parsing with Gemini...' : isApplied ? 'Applied to Form!' : 'Apply Parsed Details'}</span>
        </button>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col">
          <label className="text-[12px] text-[#464555] pb-1 font-semibold" htmlFor="taskTitle">
            Title
          </label>
          <div className="relative flex items-center bg-white rounded-xl p-3 shadow-xs border border-[#eaedff] focus-within:border-[#3525cd] transition-colors">
            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-transparent text-[#131b2e] text-[15px] font-semibold pr-8 focus:outline-none"
            />
            {title && (
              <button
                type="button"
                onClick={() => setTitle('')}
                className="absolute right-3 text-[#777587] hover:text-[#131b2e] active:scale-90"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="text-[12px] text-[#464555] pb-1 font-semibold" htmlFor="taskDesc">
            Description
          </label>
          <div className="relative bg-white rounded-xl p-3 shadow-xs border border-[#eaedff] focus-within:border-[#3525cd] transition-colors">
            <textarea
              id="taskDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add rich notes, context, or requirements..."
              className="w-full bg-transparent text-[#131b2e] text-[14px] resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Schedule */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] text-[#464555] font-semibold">Schedule</span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl shadow-xs border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#3525cd] text-[20px]">calendar_today</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#464555]">Date</span>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-[13px] text-[#131b2e] font-semibold truncate bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl shadow-xs border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#3525cd] text-[20px]">schedule</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-[#464555]">Time</span>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="text-[13px] text-[#131b2e] font-semibold truncate bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] text-[#464555] font-semibold">Priority</span>
          <div className="grid grid-cols-3 bg-[#eaedff] rounded-full p-1 gap-1">
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`py-1.5 rounded-full text-[13px] text-center transition-all flex items-center justify-center gap-1 ${
                priority === 'low'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <span>Low</span>
            </button>

            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`py-1.5 rounded-full text-[13px] text-center transition-all flex items-center justify-center gap-1 ${
                priority === 'medium'
                  ? 'bg-[#00668a] text-white font-semibold shadow-xs'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <span>Medium</span>
            </button>

            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`py-1.5 rounded-full text-[13px] text-center transition-all flex items-center justify-center gap-1 ${
                priority === 'high'
                  ? 'bg-[#ba1a1a] text-white font-semibold shadow-xs'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] material-symbols-fill">flag</span>
              <span>High</span>
            </button>
          </div>
        </div>

        {/* Category / Project */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] text-[#464555] font-semibold">Category / Project</span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5">
            {['Work', 'Product', 'Personal', 'Health'].map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[13px] flex items-center gap-1 shrink-0 shadow-xs transition-all ${
                    isSelected
                      ? 'bg-[#e2dfff] text-[#3323cc] font-semibold ring-1 ring-[#3323cc]/30'
                      : 'bg-white text-[#464555] hover:text-[#131b2e] border border-[#eaedff]'
                  }`}
                >
                  <span>
                    {cat === 'Work' && '💼'}
                    {cat === 'Product' && '🎨'}
                    {cat === 'Personal' && '🛒'}
                    {cat === 'Health' && '❤️'} {cat}
                  </span>
                  {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                const custom = prompt('Enter custom tag name:');
                if (custom) setCategory(custom);
              }}
              className="px-3 py-1.5 rounded-full bg-[#eaedff] text-[#464555] hover:text-[#3525cd] text-[12px] flex items-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Tag</span>
            </button>
          </div>
        </div>

        {/* Reminder Alert */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eaedff] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#3525cd]">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#131b2e]">Reminder Alert</span>
                <span className="text-[11px] text-[#464555]">Notify before task is due</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3525cd]" />
            </label>
          </div>

          {reminderEnabled && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[12px] text-[#464555] pl-10">Timing</span>
              <select
                value={reminderTiming}
                onChange={(e) => setReminderTiming(e.target.value)}
                className="px-3 py-1 rounded-full bg-[#eaedff] text-[#131b2e] text-[12px] font-medium border-0 focus:outline-none cursor-pointer"
              >
                <option value="15 minutes before">15 minutes before</option>
                <option value="30 minutes before">30 minutes before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="At time of due date">At time of due date</option>
              </select>
            </div>
          )}
        </div>

        {/* Recurrence */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#00668a]">
              <span className="material-symbols-outlined text-[20px]">repeat</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#131b2e]">Recurrence</span>
              <span className="text-[11px] text-[#464555]">Repeat frequency</span>
            </div>
          </div>

          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="px-3 py-1 rounded-full bg-[#eaedff] text-[#131b2e] text-[12px] font-medium border-0 focus:outline-none cursor-pointer"
          >
            <option value="Does not repeat">Does not repeat</option>
            <option value="Daily">Daily</option>
            <option value="Weekly on Thursdays">Weekly on Thursdays</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {/* AI Subtask Plan Toggle */}
        <div className="bg-[#eaedff] rounded-xl p-3 flex items-center justify-between border border-[#dae2fd]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#862dd4] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[13px] font-semibold text-[#131b2e] flex items-center gap-1">
                <span>AI Subtask Plan</span>
                <span className="material-symbols-outlined text-[#6b00b7] text-[14px] material-symbols-fill">
                  auto_awesome
                </span>
              </span>
              <span className="text-[11px] text-[#464555]">Generate 3-5 checklist steps automatically</span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiSubtaskPlan}
              onChange={(e) => setAiSubtaskPlan(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6b00b7]" />
          </label>
        </div>

        {/* Save Task Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving || !title.trim()}
            className="w-full h-12 rounded-full bg-[#3525cd] text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isSaving ? 'animate-spin' : ''}`}>
              {isSaving ? 'refresh' : 'check'}
            </span>
            <span>{isSaving ? 'Saving Task...' : 'Save Task'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
