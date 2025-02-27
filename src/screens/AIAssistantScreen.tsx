import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { SIZES, SHADOWS, useTheme } from '../theme/theme';
import { useAI } from '../contexts/AIContext';

const AIAssistantScreen = () => {
  const theme = useTheme();
  const {
    loading,
    taskSuggestions,
    habitInsights,
    dailySchedule,
    motivationalMessage,
    generateTaskSuggestions,
    analyzeHabits,
    generateDailySchedule,
    updateMotivationalMessage,
  } = useAI();

  useEffect(() => {
    updateMotivationalMessage();
  }, []);

  const renderMotivationalSection = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.motivationalCard, {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 12,
      }]}
    >
      <View style={styles.motivationalContent}>
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        <Text style={[styles.motivationalText, { color: '#FFFFFF' }]}>
          {loading ? 'Generating motivation...' : motivationalMessage || 'Tap to get motivated!'}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={updateMotivationalMessage}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderTaskSuggestions = () => (
    <Card style={{
      ...styles.sectionCard,
      backgroundColor: theme.colors.surface,
    }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Smart Task Suggestions
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={generateTaskSuggestions}
          disabled={loading}
        >
          <Ionicons
            name="bulb"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : taskSuggestions.length > 0 ? (
        taskSuggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <Text style={[styles.suggestionTitle, { color: theme.colors.text }]}>
                {suggestion.title}
              </Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(suggestion.priority, theme) }
              ]}>
                <Text style={styles.priorityText}>{suggestion.priority}</Text>
              </View>
            </View>
            <Text style={[styles.suggestionReason, { color: theme.colors.textSecondary }]}>
              {suggestion.reason}
            </Text>
            <Text style={[styles.estimatedTime, { color: theme.colors.primary }]}>
              ⏱ {suggestion.estimatedTime}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Tap the bulb to get AI-powered task suggestions!
        </Text>
      )}
    </Card>
  );

  const renderHabitInsights = () => (
    <Card style={{
      ...styles.sectionCard,
      backgroundColor: theme.colors.surface,
    }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Habit Analysis
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={analyzeHabits}
          disabled={loading}
        >
          <Ionicons
            name="analytics"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : habitInsights.length > 0 ? (
        habitInsights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={[styles.habitName, { color: theme.colors.text }]}>
              {insight.habitName}
            </Text>
            <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
              {insight.analysis}
            </Text>
            <Text style={[styles.improvementText, { color: theme.colors.primary }]}>
              💡 {insight.improvement}
            </Text>
            <View style={styles.streakPreview}>
              <Ionicons name="flame" size={16} color={theme.colors.warning} />
              <Text style={[styles.streakText, { color: theme.colors.textSecondary }]}>
                Predicted streak: {insight.streak} days
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Tap the analytics icon to get AI insights about your habits!
        </Text>
      )}
    </Card>
  );

  const renderDailySchedule = () => (
    <Card style={{
      ...styles.sectionCard,
      backgroundColor: theme.colors.surface,
    }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Smart Daily Schedule
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={generateDailySchedule}
          disabled={loading}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : dailySchedule ? (
        <Text style={[styles.scheduleText, { color: theme.colors.text }]}>
          {dailySchedule}
        </Text>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Tap the calendar icon to get your AI-optimized schedule!
        </Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        {renderMotivationalSection()}
        {renderTaskSuggestions()}
        {renderHabitInsights()}
        {renderDailySchedule()}
      </ScrollView>
    </SafeAreaView>
  );
};

const getPriorityColor = (priority: string, theme: any) => {
  switch (priority) {
    case 'high':
      return theme.colors.error;
    case 'medium':
      return theme.colors.warning;
    case 'low':
      return theme.colors.success;
    default:
      return theme.colors.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SIZES.xl,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  motivationalCard: {
    borderRadius: SIZES.lg,
    marginBottom: SIZES.xl,
    padding: SIZES.xl,
  },
  motivationalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  motivationalText: {
    flex: 1,
    fontSize: SIZES.md,
    lineHeight: 24,
  },
  refreshButton: {
    padding: SIZES.xs,
  },
  sectionCard: {
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
  },
  actionButton: {
    padding: SIZES.xs,
  },
  suggestionItem: {
    marginBottom: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  suggestionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xs,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: SIZES.sm,
    textTransform: 'capitalize',
  },
  suggestionReason: {
    fontSize: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  estimatedTime: {
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  insightItem: {
    marginBottom: SIZES.lg,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  habitName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  insightText: {
    fontSize: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  improvementText: {
    fontSize: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  streakPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  streakText: {
    fontSize: SIZES.sm,
  },
  scheduleText: {
    fontSize: SIZES.md,
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    padding: SIZES.md,
  },
});

export default AIAssistantScreen; 