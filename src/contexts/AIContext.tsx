import React, { createContext, useContext, useState } from 'react';
import { AIService, AITaskSuggestion, AIHabitInsight } from '../services/aiService';
import { useFirebase } from './FirebaseContext';
import { Task } from '../types/task';
import { Habit } from '../types/habit';

interface AIContextType {
  loading: boolean;
  taskSuggestions: AITaskSuggestion[];
  habitInsights: AIHabitInsight[];
  dailySchedule: string;
  motivationalMessage: string;
  generateTaskSuggestions: () => Promise<void>;
  analyzeHabits: () => Promise<void>;
  generateDailySchedule: () => Promise<void>;
  updateMotivationalMessage: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getUserTasks, getUserHabits } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [taskSuggestions, setTaskSuggestions] = useState<AITaskSuggestion[]>([]);
  const [habitInsights, setHabitInsights] = useState<AIHabitInsight[]>([]);
  const [dailySchedule, setDailySchedule] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');

  const generateTaskSuggestions = async () => {
    setLoading(true);
    try {
      const tasks = await getUserTasks();
      const habits = await getUserHabits();
      const suggestions = await AIService.generateTaskSuggestions(tasks as Task[], habits as Habit[]);
      setTaskSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating task suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeHabits = async () => {
    setLoading(true);
    try {
      const habits = await getUserHabits();
      const insights = await AIService.analyzeHabits(habits as Habit[]);
      setHabitInsights(insights);
    } catch (error) {
      console.error('Error analyzing habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailySchedule = async () => {
    setLoading(true);
    try {
      const tasks = await getUserTasks();
      const habits = await getUserHabits();
      const schedule = await AIService.generateDailySchedule(tasks as Task[], habits as Habit[]);
      setDailySchedule(schedule);
    } catch (error) {
      console.error('Error generating daily schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMotivationalMessage = async () => {
    setLoading(true);
    try {
      const tasks = await getUserTasks();
      const habits = await getUserHabits();
      const message = await AIService.generateMotivationalMessage(tasks as Task[], habits as Habit[]);
      setMotivationalMessage(message);
    } catch (error) {
      console.error('Error updating motivational message:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AIContextType = {
    loading,
    taskSuggestions,
    habitInsights,
    dailySchedule,
    motivationalMessage,
    generateTaskSuggestions,
    analyzeHabits,
    generateDailySchedule,
    updateMotivationalMessage,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}; 