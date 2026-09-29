import React, { useState, useEffect } from 'react';
import { Task, CopilotMessage, TabType } from './types';
import { INITIAL_TASKS, INITIAL_COPILOT_MESSAGES } from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayScreen } from './components/TodayScreen';
import { TaskDetailScreen } from './components/TaskDetailScreen';
import { AddTaskScreen } from './components/AddTaskScreen';
import { AiAssistantScreen } from './components/AiAssistantScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskai_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>(() => {
    const saved = localStorage.getItem('taskai_messages');
    return saved ? JSON.parse(saved) : INITIAL_COPILOT_MESSAGES;
  });

  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('taskai_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskai_messages', JSON.stringify(copilotMessages));
  }, [copilotMessages]);

  // Task actions
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const willBeCompleted = !t.completed;
          return {
            ...t,
            completed: willBeCompleted,
            status: willBeCompleted ? 'completed' : 'today',
            completedAt: willBeCompleted ? 'Just now' : undefined,
          };
        }
        return t;
      })
    );

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              completed: !prev.completed,
              status: !prev.completed ? 'completed' : 'today',
            }
          : null
      );
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const handleSaveNewTask = (newTaskPartial: Partial<Task>) => {
    const newTask: Task = {
      id: newTaskPartial.id || `task-${Date.now()}`,
      title: newTaskPartial.title || 'Untitled Task',
      description: newTaskPartial.description || '',
      category: newTaskPartial.category || 'Work',
      priority: newTaskPartial.priority || 'medium',
      status: newTaskPartial.status || 'today',
      date: newTaskPartial.date || 'Today, Oct 24',
      time: newTaskPartial.time || '10:00 AM',
      reminder: newTaskPartial.reminder || '15 mins before',
      estEffort: newTaskPartial.estEffort || '45 mins',
      completed: false,
      subtasks: newTaskPartial.subtasks || [],
      notes: newTaskPartial.notes || [],
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsAddTaskOpen(false);
  };

  const handleRescheduleOverdue = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'today',
            date: 'Today, Oct 24',
            time: '4:00 PM',
            timeLeft: 'In 3 hours',
          };
        }
        return t;
      })
    );
  };

  const handleQuickAiPrompt = (prompt: string) => {
    // If prompt mentions chat / questions, route to TaskAI tab with prompt
    setActiveTab('ai-assistant');
    handleSendCopilotMessage(prompt);
  };

  const handleSendCopilotMessage = async (userText: string) => {
    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setCopilotMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          currentTasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            time: t.time,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: CopilotMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || 'Task plan updated.',
          timestamp: 'Just now',
          recommendedTask: data.recommendedTask,
          breakdown: data.breakdown,
          calendarProposal: data.calendarProposal,
          rescheduleSuggestion: data.rescheduleSuggestion,
        };
        setCopilotMessages((prev) => [...prev, aiMsg]);
        return;
      }
    } catch {
      // Fallback
    }

    const aiFallbackMsg: CopilotMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Understood! I've updated your focus schedule based on "${userText}".`,
      timestamp: 'Just now',
    };
    setCopilotMessages((prev) => [...prev, aiFallbackMsg]);
  };

  const handleClearSession = () => {
    setCopilotMessages([]);
  };

  // Screen header title logic
  let headerTitle: string | undefined = undefined;
  let showBack = false;

  if (selectedTask) {
    headerTitle = 'Task Details';
    showBack = true;
  } else if (isAddTaskOpen) {
    headerTitle = 'Add Task';
    showBack = true;
  } else if (activeTab === 'ai-assistant') {
    headerTitle = 'TaskAI';
  } else if (activeTab === 'calendar') {
    headerTitle = 'Calendar';
  } else if (activeTab === 'analytics') {
    headerTitle = 'Analytics';
  }

  const handleHeaderBack = () => {
    if (selectedTask) {
      setSelectedTask(null);
    } else if (isAddTaskOpen) {
      setIsAddTaskOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col relative select-none">
      {/* Top Header */}
      <Header
        title={headerTitle}
        showBack={showBack}
        onBack={handleHeaderBack}
        onAskAiClick={() => {
          setSelectedTask(null);
          setIsAddTaskOpen(false);
          setActiveTab('ai-assistant');
        }}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full relative">
        {selectedTask ? (
          <TaskDetailScreen
            task={selectedTask}
            onBack={() => setSelectedTask(null)}
            onUpdateTask={handleUpdateTask}
            onToggleComplete={handleToggleTask}
          />
        ) : isAddTaskOpen ? (
          <AddTaskScreen
            onClose={() => setIsAddTaskOpen(false)}
            onSaveTask={handleSaveNewTask}
          />
        ) : (
          <>
            {activeTab === 'today' && (
              <TodayScreen
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onSelectTask={(task) => setSelectedTask(task)}
                onAddTaskClick={() => setIsAddTaskOpen(true)}
                onRescheduleOverdue={handleRescheduleOverdue}
                onQuickAiPrompt={handleQuickAiPrompt}
              />
            )}

            {activeTab === 'ai-assistant' && (
              <AiAssistantScreen
                tasks={tasks}
                messages={copilotMessages}
                onSendMessage={handleSendCopilotMessage}
                onAddTask={handleSaveNewTask}
                onClearSession={handleClearSession}
                onOpenAddTask={() => setIsAddTaskOpen(true)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarScreen
                tasks={tasks}
                onSelectTask={(task) => setSelectedTask(task)}
                onAddTask={() => setIsAddTaskOpen(true)}
              />
            )}

            {activeTab === 'analytics' && <AnalyticsScreen tasks={tasks} />}

            {activeTab === 'profile' && (
              <div className="max-w-lg mx-auto px-4 pt-24 pb-36">
                <div className="p-6 bg-white rounded-2xl border border-[#eaedff] shadow-sm text-center">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcbRVpBZyB3k1Rbct745fNhW7cll4uwCe3d5GmtivM_4n8vKzObEQVzoOmHaL6_o57sXUEF-D0duYB35Do2JAoVM2xl7dEXpZ8aueT1AGI0g4crFuh96DaMX03m8LkJTG2RnutA3Inp1RFNJrds8LWzxa-FBJeE_4yh68CHO6fXz7vhdVO2mbp6dbC-8Hi-F6VRp9zKV-_qzKCVoYyhS3fZmn1XCMv-9ghVfgcFsqIHXWvzjhRnH2QQA"
                    alt="Sarah"
                    className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-[#e2dfff]"
                  />
                  <h2 className="text-[20px] font-bold mt-3">Sarah Jenkins</h2>
                  <p className="text-[13px] text-[#464555]">VP Product Strategy</p>
                  <p className="text-[12px] text-[#777587]">sarah.j@enterprise.io</p>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-[#3525cd] text-white text-[13px] font-semibold rounded-full"
                  >
                    Open Settings & AI Controls
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Nav Bar (hidden when in full screen subview like Task Details or Add Task) */}
      {!selectedTask && !isAddTaskOpen && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedTask(null);
            setIsAddTaskOpen(false);
            setActiveTab(tab);
          }}
        />
      )}

      {/* User Profile & AI Settings Drawer */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
