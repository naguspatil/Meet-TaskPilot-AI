import { Task, CopilotMessage } from '../types';

export const USER_PROFILE = {
  name: 'Sarah',
  fullName: 'Sarah Jenkins',
  email: 'sarah.j@enterprise.io',
  role: 'VP Product Strategy',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcbRVpBZyB3k1Rbct745fNhW7cll4uwCe3d5GmtivM_4n8vKzObEQVzoOmHaL6_o57sXUEF-D0duYB35Do2JAoVM2xl7dEXpZ8aueT1AGI0g4crFuh96DaMX03m8LkJTG2RnutA3Inp1RFNJrds8LWzxa-FBJeE_4yh68CHO6fXz7vhdVO2mbp6dbC-8Hi-F6VRp9zKV-_qzKCVoYyhS3fZmn1XCMv-9ghVfgcFsqIHXWvzjhRnH2QQA',
  isPro: true,
};

export const TASK_AI_LOGO = 'https://lh3.googleusercontent.com/aida/AEtjO1WJHurjgfb19IseDNfhcjL0b2M9yGTj5LEN4POuL0HD9VDWkMSrnQ-dv1l6n4yzD0zcIhRCPD1mALgZKm7W_TogjYXO8psmhudtqD-Js9xS3MHlGkoNdWSiygW4fqIPiOAiX0irsrEn1QOqoxdkTM_b95KppfNDSPrJ8BXS00E4w2pz20HplMzqDCOIBo196BcrRJPbLlvafz8GFtA8FmMdVip_eLdWQif752u_m9zjYGJJZC4kI2uIBmf-';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-pres',
    title: 'Prepare Q4 Executive Strategy Presentation',
    description: 'Synthesize department deliverables, runway projections, and 2025 hiring roadmap for Board presentation.',
    category: 'Work',
    priority: 'high',
    status: 'today',
    date: 'Today, Oct 24',
    time: '4:00 PM',
    timeLeft: 'In 3 hours',
    reminder: '30 mins before',
    estEffort: '1 hr 30 mins',
    isFavorite: false,
    completed: false,
    aiSynced: '4m ago',
    notes: [
      'Ensure slide 4 highlights the 18% expansion runway achieved in Q3.',
      'Incorporate revised Engineering headcounts provided by Marcus.',
      'Keep presentation strictly under 20 slides to protect Q&A allotment.'
    ],
    attachments: [
      {
        title: 'slides.corp/q4-deck',
        subtitle: 'Cloud Presentation • Updated 1h ago',
        icon: 'slideshow',
        url: '#deck'
      }
    ],
    subtasks: [
      { id: 'st-1', title: '1. Research competitor Q3 revenue benchmarks', est: 'Auto-verified via Web', completed: true, autoVerified: true },
      { id: 'st-2', title: '2. Draft 5-pillar strategic roadmap outline', est: 'Est: 25 mins', completed: false },
      { id: 'st-3', title: '3. Generate visual slides in corporate theme', est: 'Est: 30 mins', completed: false },
      { id: 'st-4', title: '4. Review financial projections with CFO', est: 'Needs confirmation sync', completed: false },
      { id: 'st-5', title: '5. Conduct 15-minute dry run rehearsal', est: 'Est: 15 mins', completed: false },
    ]
  },
  {
    id: 'task-fin',
    title: 'Finalize Q3 Financial Report',
    description: 'Review latest spreadsheet numbers from marketing before sending to VP and executive team.',
    category: 'Work',
    priority: 'high',
    status: 'today',
    date: 'Today, Oct 24',
    time: '1:30 PM',
    timeLeft: '45m left',
    reminder: '15 mins before',
    estEffort: '1 hr',
    isFavorite: true,
    completed: false,
    sharedWith: {
      name: 'Elena V.',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtCMZhVn4ANijIl4QawGOiMqrXp813paf6yzu9i1qRQvCGT6G_UpXK0oLbgczABB4GLIURC9_RsWG0uaXlL4kzTX8k9l6EPWzF96GBilE5u_TS1ppFMEqumQkm4_1PXgnIYt3GE_D_tZtSVAZA3LINgkyhJIlsfFOeHofsxO1KNQzTQuO2sRzbcVxu2YYhy1jon5f0wpALXw5ZaR3bGH0Irqr5qHK5wC2dUdAD2hiMW-f-i25HllBvZw'
    },
    subtasks: [
      { id: 'st-f1', title: 'Reconcile APAC operating expense anomalies', est: '15m', completed: true },
      { id: 'st-f2', title: 'Update revenue waterfall chart', est: '20m', completed: true },
      { id: 'st-f3', title: 'Cross-check EBITDA margin projections with audit team', est: '15m', completed: true },
      { id: 'st-f4', title: 'Compile executive PDF one-pager', est: '15m', completed: true },
      { id: 'st-f5', title: 'Send advance copy to CFO & VP Finance', est: '10m', completed: false },
      { id: 'st-f6', title: 'Verify presentation deck synchronicity', est: '10m', completed: false },
    ]
  },
  {
    id: 'task-design',
    title: 'Review design tokens & iOS sync',
    description: 'Align mobile design system tokens with Android Material 3 and Xcode swift export.',
    category: 'Product',
    priority: 'medium',
    status: 'today',
    date: 'Today, Oct 24',
    time: '3:30 PM',
    reminder: '30 mins before',
    estEffort: '45 mins',
    completed: false,
    subtasks: [
      { id: 'st-d1', title: 'Audit Figma typography styles vs tokens repo', est: '15m', completed: false },
      { id: 'st-d2', title: 'Test dark mode contrast in Xcode simulator', est: '20m', completed: false },
    ]
  },
  {
    id: 'task-groceries',
    title: 'Buy groceries for dinner',
    description: 'Pick up fresh produce, wild salmon, and Greek yogurt for healthy family dinner.',
    category: 'Personal',
    priority: 'low',
    status: 'today',
    date: 'Today, Oct 24',
    time: '6:00 PM',
    reminder: '1 hour before',
    estEffort: '30 mins',
    completed: false,
    subtasks: [
      { id: 'st-g1', title: 'Organic spinach and arugula blend', est: '5m', completed: false },
      { id: 'st-g2', title: 'Wild salmon fillets', est: '5m', completed: false },
      { id: 'st-g3', title: 'Greek yogurt & berries', est: '5m', completed: false },
    ]
  },
  {
    id: 'task-overdue-1',
    title: 'Submit expense receipts for October',
    description: 'Submit receipts and travel expenses for Q3 stakeholder dinners to corporate finance portal.',
    category: 'Work',
    priority: 'high',
    status: 'overdue',
    date: 'Yesterday, 5:00 PM • Finance',
    time: 'Yesterday, 5:00 PM',
    completed: false,
    subtasks: [
      { id: 'st-o1', title: 'Scan restaurant and hotel receipts', est: '10m', completed: true },
      { id: 'st-o2', title: 'Enter accounting cost codes', est: '10m', completed: false },
    ]
  },
  // Completed items
  {
    id: 'comp-1',
    title: 'Morning 15m inbox zero sweep',
    description: 'Cleared customer support escalations and urgent email queries.',
    category: 'Work',
    priority: 'low',
    status: 'completed',
    date: 'Today, Oct 24',
    time: '8:45 AM',
    completed: true,
    completedAt: '8:45 AM',
  },
  {
    id: 'comp-2',
    title: 'Daily team standup call',
    description: 'Synced with engineering sprint leads on sprint velocity.',
    category: 'Work',
    priority: 'medium',
    status: 'completed',
    date: 'Today, Oct 24',
    time: '9:30 AM',
    completed: true,
    completedAt: '9:30 AM',
  },
  {
    id: 'comp-3',
    title: 'Approve design system PR #348',
    description: 'Reviewed component token variables and merged PR into main branch.',
    category: 'Product',
    priority: 'medium',
    status: 'completed',
    date: 'Today, Oct 24',
    time: '10:15 AM',
    completed: true,
    completedAt: '10:15 AM',
  },
  {
    id: 'comp-4',
    title: 'Hydrate & 10 min wellness stretch',
    description: 'Posture reset, hydration, and neck stretch break.',
    category: 'Health',
    priority: 'low',
    status: 'completed',
    date: 'Today, Oct 24',
    time: '11:00 AM',
    completed: true,
    completedAt: '11:00 AM',
  },
];

export const INITIAL_COPILOT_MESSAGES: CopilotMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'What should I focus on today and can you break down my presentation task?',
    timestamp: '9:41 AM · Delivered',
  },
  {
    id: 'msg-2',
    sender: 'ai',
    text: 'Good morning Sarah! Looking at your 7 tasks today, here is your optimal AI-curated focus plan:',
    timestamp: '9:41 AM',
    recommendedTask: {
      id: 'task-fin',
      title: '1. Finalize Q3 Financial Report',
      priority: 'High Priority',
      time: '1:30 PM',
      whyFirst: 'Takes the most cognitive load; do this before your 2:00 PM executive sync to eliminate friction.',
    },
    breakdown: {
      taskTitle: 'Prepare Executive Presentation',
      subtasks: [
        { id: 'cop-st-1', title: '1. Research market benchmark data', est: '15m', completed: false },
        { id: 'cop-st-2', title: '2. Create storyline outline & key takeaways', est: '20m', completed: false },
        { id: 'cop-st-3', title: '3. Design 8 slide visual deck', est: '45m', completed: false },
        { id: 'cop-st-4', title: '4. Review citations & financial numbers', est: '15m', completed: false },
        { id: 'cop-st-5', title: '5. Rehearse pitch & time speaker notes', est: '15m', completed: false },
      ],
    },
    calendarProposal: {
      prompt: 'Would you like me to block 10:00 AM – 11:30 AM on your calendar for this deep work block?',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      isScheduled: false,
    },
  },
];
