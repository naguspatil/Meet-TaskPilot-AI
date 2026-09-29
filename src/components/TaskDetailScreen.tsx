import React, { useState } from 'react';
import { Task, Subtask } from '../types';

interface TaskDetailScreenProps {
  task: Task;
  onBack: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  task,
  onBack,
  onUpdateTask,
  onToggleComplete,
}) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>(
    task.subtasks || [
      { id: '1', title: '1. Research competitor Q3 revenue benchmarks', est: 'Auto-verified via Web', completed: true, autoVerified: true },
      { id: '2', title: '2. Draft 5-pillar strategic roadmap outline', est: 'Est: 25 mins', completed: false },
      { id: '3', title: '3. Generate visual slides in corporate theme', est: 'Est: 30 mins', completed: false },
      { id: '4', title: '4. Review financial projections with CFO', est: 'Needs confirmation sync', completed: false },
      { id: '5', title: '5. Conduct 15-minute dry run rehearsal', est: 'Est: 15 mins', completed: false },
    ]
  );
  const [isFavorite, setIsFavorite] = useState<boolean>(task.isFavorite || false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [newStepInput, setNewStepInput] = useState<string>('');
  const [isAddingStep, setIsAddingStep] = useState<boolean>(false);
  const [isEditingModal, setIsEditingModal] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updated);
    onUpdateTask({ ...task, subtasks: updated });
  };

  const handleToggleMainCompletion = () => {
    onToggleComplete(task.id);
    if (!task.completed) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    }
  };

  const handleRegenerateSubtasks = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/gemini/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.subtasks && Array.isArray(data.subtasks)) {
          const formatted: Subtask[] = data.subtasks.map((item: any, idx: number) => ({
            id: `gen-${Date.now()}-${idx}`,
            title: `${idx + 1}. ${item.title.replace(/^\d+\.\s*/, '')}`,
            est: item.estMinutes ? `Est: ${item.estMinutes} mins` : item.note || 'AI milestone',
            completed: false,
            autoVerified: item.autoVerified || false,
          }));
          setSubtasks(formatted);
          onUpdateTask({ ...task, subtasks: formatted });
        }
      }
    } catch {
      // Fallback
      const refreshed: Subtask[] = [
        { id: 'rf-1', title: '1. Synthesize executive KPI variances', est: 'Auto-verified via Web', completed: true, autoVerified: true },
        { id: 'rf-2', title: '2. Generate slide deck narrative architecture', est: 'Est: 20 mins', completed: false },
        { id: 'rf-3', title: '3. Reconcile runway cash model with Finance team', est: 'Needs confirmation sync', completed: false },
        { id: 'rf-4', title: '4. Polish keynote styling and transition cadence', est: 'Est: 25 mins', completed: false },
        { id: 'rf-5', title: '5. Complete executive rehearsal dry-run', est: 'Est: 15 mins', completed: false },
      ];
      setSubtasks(refreshed);
      onUpdateTask({ ...task, subtasks: refreshed });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepInput.trim()) return;
    const newStep: Subtask = {
      id: `custom-${Date.now()}`,
      title: `${subtasks.length + 1}. ${newStepInput.trim()}`,
      est: 'Est: 15 mins',
      completed: false,
    };
    const updated = [...subtasks, newStep];
    setSubtasks(updated);
    onUpdateTask({ ...task, subtasks: updated });
    setNewStepInput('');
    setIsAddingStep(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTask({
      ...task,
      title: editTitle,
      description: editDesc,
    });
    setIsEditingModal(false);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pb-32 pt-22 gap-4">
      {/* Sub-Header Actions */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#c4e7ff] text-[#001e2c] text-[13px] font-medium shadow-xs">
            <span>💼</span> {task.category}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              task.priority === 'high'
                ? 'bg-[#ffdad6] text-[#93000a]'
                : task.priority === 'medium'
                ? 'bg-amber-100 text-amber-900'
                : 'bg-emerald-100 text-emerald-900'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                task.priority === 'high' ? 'bg-[#ba1a1a]' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            {task.priority === 'high' ? 'High Priority' : task.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsFavorite(!isFavorite);
              onUpdateTask({ ...task, isFavorite: !isFavorite });
            }}
            aria-label="Star task"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eaedff] text-[#464555] hover:bg-[#e2e7ff] active:scale-90 transition-all"
          >
            <span
              className={`material-symbols-outlined text-[20px] transition-colors ${
                isFavorite ? 'text-amber-500 material-symbols-fill' : ''
              }`}
            >
              star
            </span>
          </button>

          <button
            onClick={() => setIsEditingModal(true)}
            aria-label="Options"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#eaedff] text-[#464555] hover:bg-[#e2e7ff] active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </div>

      {/* Hero Status Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-[#eaedff]/70 transition-all duration-300">
        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-gradient-to-br from-[#e2dfff] to-[#7bd0ff] opacity-40 blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          <button
            onClick={handleToggleMainCompletion}
            aria-label="Toggle task status"
            className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center active:scale-90 transition-all duration-200 ${
              task.completed
                ? 'bg-[#3525cd] border-[#3525cd] text-white shadow-sm'
                : 'border-[#c7c4d8] text-transparent hover:border-[#3525cd]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] font-bold">check</span>
          </button>

          <div className="flex-1 min-w-0">
            <h2
              className={`text-[20px] font-bold text-[#131b2e] leading-snug transition-all ${
                task.completed ? 'line-through text-[#777587]' : ''
              }`}
            >
              {task.title}
            </h2>
            <p className="mt-1.5 text-[14px] text-[#464555] leading-relaxed">
              {task.description}
            </p>
          </div>
        </div>

        {/* Quick Completion Action Trigger */}
        <div className="mt-4 pt-3 border-t border-[#eaedff]/70 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-[#464555]">
            <span className="material-symbols-outlined text-[16px] text-[#6b00b7]">auto_awesome</span>
            <span>AI Auto-Synced {task.aiSynced || '4m ago'}</span>
          </div>

          <button
            onClick={handleToggleMainCompletion}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold active:scale-95 transition-all ${
              task.completed
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-[#e2e7ff] text-[#3525cd] hover:bg-[#e2dfff]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {task.completed ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span>{task.completed ? 'Completed' : 'Mark Completed'}</span>
          </button>
        </div>
      </div>

      {/* Metadata Card Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Due Date */}
        <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-1 text-[#ba1a1a] mb-1">
            <span className="material-symbols-outlined text-[17px]">event</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Due Date</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#131b2e]">{task.date}</p>
            <p className="text-[12px] text-[#ba1a1a] font-medium">
              {task.time} {task.timeLeft ? `• ${task.timeLeft}` : ''}
            </p>
          </div>
        </div>

        {/* Reminder */}
        <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-1 text-[#00668a] mb-1">
            <span className="material-symbols-outlined text-[17px]">notifications_active</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Reminder</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#131b2e]">{task.reminder || '30 mins before'}</p>
            <p className="text-[12px] text-[#464555]">Push Notification</p>
          </div>
        </div>

        {/* Project */}
        <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-1 text-[#3525cd] mb-1">
            <span className="material-symbols-outlined text-[17px]">folder_special</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Project</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#131b2e] truncate">Corporate Strategy</p>
            <p className="text-[12px] text-[#464555]">Executive Leadership</p>
          </div>
        </div>

        {/* Duration / Est Effort */}
        <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-1 text-[#6b00b7] mb-1">
            <span className="material-symbols-outlined text-[17px]">timelapse</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Est. Effort</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#131b2e]">{task.estEffort || '1 hr 30 mins'}</p>
            <p className="text-[12px] text-[#464555]">Deep Focus Mode</p>
          </div>
        </div>
      </div>

      {/* AI Subtask Generator Section */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#eaedff]/70 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-r from-[#ddb7ff] via-[#e2dfff] to-[#7bd0ff] rounded-full blur-3xl opacity-40 pointer-events-none" />

        {/* AI Header Banner */}
        <div className="flex items-center justify-between mb-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3525cd] to-[#6b00b7] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">magic_button</span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#131b2e] flex items-center gap-1.5">
                AI Subtask Assistant
                <span className="px-2 py-0.5 rounded-full bg-[#f0dbff] text-[#2c0051] text-[10px] font-bold uppercase tracking-wider">
                  V3.5
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#6b00b7] text-[12px] font-semibold">
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
            <span>Done</span>
          </div>
        </div>

        <p className="text-[13px] text-[#464555] mb-3 relative z-10">
          TaskAI decomposed this complex deliverable into {totalSubtasks} actionable, sequential milestones:
        </p>

        {/* Linear Visual Progress Bar */}
        <div className="w-full h-1.5 bg-[#dae2fd] rounded-full overflow-hidden mb-3 relative z-10">
          <div
            className="h-full bg-gradient-to-r from-[#3525cd] to-[#6b00b7] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="flex flex-col gap-2 relative z-10">
          {subtasks.map((step) => (
            <label
              key={step.id}
              className="group flex items-start gap-3 p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] transition-all cursor-pointer border border-[#eaedff]/60"
            >
              <input
                type="checkbox"
                checked={step.completed}
                onChange={() => handleToggleSubtask(step.id)}
                className="mt-0.5 w-5 h-5 rounded accent-[#3525cd] cursor-pointer transition-transform group-active:scale-95"
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[13px] transition-all ${
                    step.completed ? 'line-through text-[#777587]' : 'text-[#131b2e] font-medium'
                  }`}
                >
                  {step.title}
                </span>

                <div className="flex items-center gap-2 mt-1">
                  {step.autoVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#00668a] font-medium">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      Auto-verified via Web
                    </span>
                  ) : (
                    <span className="text-[#464555] text-[11px]">{step.est}</span>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Add Step Inline Form */}
        {isAddingStep && (
          <form onSubmit={handleAddStepSubmit} className="mt-3 flex gap-2 relative z-10">
            <input
              type="text"
              autoFocus
              value={newStepInput}
              onChange={(e) => setNewStepInput(e.target.value)}
              placeholder="Enter new milestone step..."
              className="flex-1 px-3 py-2 text-[13px] bg-[#f2f3ff] border border-[#3525cd] rounded-xl focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#3525cd] text-white text-[12px] font-semibold rounded-xl"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingStep(false)}
              className="px-2 py-2 text-[#464555] text-[12px]"
            >
              Cancel
            </button>
          </form>
        )}

        {/* AI Subtask Action Buttons */}
        <div className="mt-4 flex items-center gap-2 pt-1 relative z-10">
          <button
            onClick={handleRegenerateSubtasks}
            disabled={isRegenerating}
            className="flex-1 h-11 px-3 rounded-full bg-gradient-to-r from-[#3525cd] to-[#6b00b7] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all hover:brightness-105"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isRegenerating ? 'animate-spin' : ''
              }`}
            >
              auto_awesome
            </span>
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
          </button>

          <button
            onClick={() => setIsAddingStep(true)}
            className="h-11 px-4 rounded-full bg-[#eaedff] text-[#3525cd] hover:bg-[#e2e7ff] text-[13px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* Notes & Attachments Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-[16px] font-bold text-[#131b2e] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#464555]">description</span>
            Notes & Attachments
          </h3>
          <span className="text-[12px] text-[#3525cd] font-medium">1 Link • 3 bullets</span>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#eaedff]/70 flex flex-col gap-3">
          <ul className="space-y-2 text-[#464555] text-[13px]">
            {(
              task.notes || [
                'Ensure slide 4 highlights the 18% expansion runway achieved in Q3.',
                'Incorporate revised Engineering headcounts provided by Marcus.',
                'Keep presentation strictly under 20 slides to protect Q&A allotment.',
              ]
            ).map((note, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd] mt-2 flex-shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>

          {/* Deck Attachment Pill */}
          <a
            href="#deck"
            onClick={(e) => {
              e.preventDefault();
              alert('Opening Corporate Cloud Presentation: slides.corp/q4-deck');
            }}
            className="mt-1 flex items-center justify-between p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#eaedff] transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">slideshow</span>
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#131b2e] truncate group-hover:text-[#3525cd] transition-colors">
                  slides.corp/q4-deck
                </p>
                <p className="text-[12px] text-[#464555]">Cloud Presentation • Updated 1h ago</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[#464555] group-hover:translate-x-0.5 transition-transform">
              open_in_new
            </span>
          </a>
        </div>
      </div>

      {/* Delighting micro-toast celebration */}
      <div
        className={`fixed bottom-24 left-4 right-4 max-w-md mx-auto z-50 p-4 rounded-2xl bg-[#283044] text-[#eef0ff] shadow-2xl flex items-center justify-between transform transition-all duration-300 ${
          showCelebration
            ? 'translate-y-0 opacity-100'
            : 'translate-y-32 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#40c2fd] text-[#004d6a] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">Presentation Completed! 🎉</p>
            <p className="text-[12px] text-white/80">Logged to Corporate Archive</p>
          </div>
        </div>
        <button
          onClick={handleToggleMainCompletion}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium active:scale-95 transition-all"
        >
          Undo
        </button>
      </div>

      {/* Edit Task Modal */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-[16px] font-bold text-[#131b2e] mb-3">Edit Task</h3>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#464555]">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#f2f3ff] border border-[#eaedff] rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#464555]">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] bg-[#f2f3ff] border border-[#eaedff] rounded-xl focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModal(false)}
                  className="px-3 py-2 text-[12px] text-[#464555]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3525cd] text-white text-[12px] font-semibold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Bottom Floating Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf8ff]/90 backdrop-blur-xl px-4 py-3 border-t border-[#eaedff]/70 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto flex items-center gap-3 pb-safe">
          <button
            onClick={() => setIsEditingModal(true)}
            className="flex-1 h-12 rounded-full bg-[#eaedff] text-[#131b2e] text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#e2e7ff] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px] text-[#464555]">edit</span>
            <span>Edit Task</span>
          </button>

          <button
            onClick={handleToggleMainCompletion}
            className={`flex-[1.5] h-12 rounded-full text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              task.completed
                ? 'bg-[#862dd4] shadow-[#862dd4]/25'
                : 'bg-[#3525cd] shadow-[#3525cd]/25 hover:bg-[#4f46e5]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span>{task.completed ? 'Completed!' : 'Mark as Completed'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
