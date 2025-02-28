import OpenAI from 'openai';
import { Task } from '../types/task';
import { Habit } from '../types/habit';

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export interface AITaskSuggestion {
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export interface AIHabitInsight {
  habitName: string;
  analysis: string;
  improvement: string;
  streak: number;
}

export class AIService {
  // Generate personalized task suggestions based on user's habits and existing tasks
  static async generateTaskSuggestions(
    currentTasks: Task[],
    habits: Habit[]
  ): Promise<AITaskSuggestion[]> {
    const prompt = `As an AI life coach, analyze these current tasks and habits:
      Tasks: ${JSON.stringify(currentTasks)}
      Habits: ${JSON.stringify(habits)}
      
      Based on this information, suggest 3 new tasks that would help the user improve their productivity and well-being.
      Consider task variety, user's patterns, and potential areas of improvement.
      Return only a JSON array with objects containing: title, reason, priority, and estimatedTime.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const suggestions = JSON.parse(response.choices[0].message.content || '[]');
      return suggestions as AITaskSuggestion[];
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return [];
    }
  }

  // Analyze habits and provide personalized insights
  static async analyzeHabits(habits: Habit[]): Promise<AIHabitInsight[]> {
    const prompt = `As an AI habit coach, analyze these habits:
      ${JSON.stringify(habits)}
      
      For each habit, provide:
      1. An analysis of current performance
      2. Specific suggestions for improvement
      3. Streak prediction based on current patterns
      
      Return only a JSON array with objects containing: habitName, analysis, improvement, and streak.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const insights = JSON.parse(response.choices[0].message.content || '[]');
      return insights as AIHabitInsight[];
    } catch (error) {
      console.error('Error analyzing habits:', error);
      return [];
    }
  }

  // Generate a personalized daily schedule
  static async generateDailySchedule(
    tasks: Task[],
    habits: Habit[]
  ): Promise<string> {
    const prompt = `As an AI productivity expert, create an optimized daily schedule considering:
      Tasks: ${JSON.stringify(tasks)}
      Habits: ${JSON.stringify(habits)}
      
      Create a detailed schedule that:
      1. Prioritizes important tasks
      2. Incorporates habit-building activities
      3. Includes breaks and buffer time
      4. Suggests optimal times for different activities
      
      Return a human-readable schedule with time blocks and explanations.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating daily schedule:', error);
      return '';
    }
  }

  // Provide motivational messages based on user's progress
  static async generateMotivationalMessage(
    tasks: Task[],
    habits: Habit[]
  ): Promise<string> {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const habitStreaks = habits.map(h => h.streak);

    const prompt = `As an AI motivational coach, create a personalized message considering:
      - Completed ${completedTasks} out of ${totalTasks} tasks
      - Habit streaks: ${habitStreaks.join(', ')}
      
      Create an encouraging and motivational message that:
      1. Acknowledges specific achievements
      2. Provides genuine encouragement
      3. Offers a specific tip for improvement
      
      Keep the message concise, personal, and actionable.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating motivational message:', error);
      return '';
    }
  }
} 