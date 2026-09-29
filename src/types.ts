export interface Subtask {
  id: string;
  title: string;
  est?: string;
  estMinutes?: number;
  completed: boolean;
  autoVerified?: boolean;
}

export interface Attachment {
  title: string;
  subtitle: string;
  icon: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Work' | 'Product' | 'Personal' | 'Health' | string;
  priority: 'high' | 'medium' | 'low';
  status: 'today' | 'overdue' | 'completed';
  date: string;
  time: string;
  timeLeft?: string;
  reminder?: string;
  estEffort?: string;
  isFavorite?: boolean;
  completed: boolean;
  completedAt?: string;
  sharedWith?: {
    name: string;
    avatarUrl: string;
  };
  aiSynced?: string;
  notes?: string[];
  attachments?: Attachment[];
  subtasks?: Subtask[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedTask?: {
    id?: string;
    title: string;
    priority: string;
    time: string;
    whyFirst: string;
  };
  breakdown?: {
    taskTitle: string;
    subtasks: Array<{
      id: string;
      title: string;
      est: string;
      completed?: boolean;
    }>;
  };
  calendarProposal?: {
    prompt: string;
    startTime: string;
    endTime: string;
    isScheduled?: boolean;
  };
  rescheduleSuggestion?: {
    taskTitle: string;
    newTime: string;
  };
}

export type TabType = 'today' | 'calendar' | 'ai-assistant' | 'analytics' | 'profile';
