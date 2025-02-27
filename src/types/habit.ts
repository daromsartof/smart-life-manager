export interface Habit {
  id: string;
  title: string;
  streak: number;
  target: number;
  progress: number;
  category: 'health' | 'productivity' | 'mindfulness' | 'fitness';
  lastChecked?: Date;
  userId: string;
  createdAt: Date;
} 