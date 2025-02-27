import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useFirebase } from '../contexts/FirebaseContext';
import { SIZES, useTheme } from '../theme/theme';

interface Stats {
  tasksCompleted: number;
  totalTasks: number;
  habitsActive: number;
  averageStreak: number;
  weeklyProgress: number[];
  categoryDistribution: {
    [key: string]: number;
  };
}

const StatsScreen = () => {
  const { getUserTasks, getUserHabits } = useFirebase();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    tasksCompleted: 0,
    totalTasks: 0,
    habitsActive: 0,
    averageStreak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    categoryDistribution: {},
  });

  const chartConfig = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => {
      const primaryColor = theme.colors.primary;
      return `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, ${opacity})`;
    },
    labelColor: () => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    propsForLabels: {
      fill: theme.colors.text,
    },
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    strokeWidth: 2,
  }), [theme.colors, isDark]);

  const progressData = useMemo(() => ({
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: stats.weeklyProgress,
        color: (opacity = 1) => theme.colors.primary + (opacity < 1 ? Math.round(opacity * 255).toString(16) : ''),
        strokeWidth: 2,
      },
    ],
  }), [stats.weeklyProgress, theme.colors.primary]);

  const categoryData = useMemo(() => ({
    labels: Object.keys(stats.categoryDistribution).map(cat => 
      cat.charAt(0).toUpperCase() + cat.slice(1)
    ),
    datasets: [
      {
        data: Object.values(stats.categoryDistribution),
        color: (opacity = 1) => theme.colors.primary + (opacity < 1 ? Math.round(opacity * 255).toString(16) : ''),
      },
    ],
  }), [stats.categoryDistribution, theme.colors.primary]);

  const calculateWeeklyProgress = (tasks: any[], habits: any[]) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weeklyData = Array(7).fill(0);

    tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const dayDiff = Math.floor((completedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          weeklyData[dayDiff]++;
        }
      }
    });

    habits.forEach(habit => {
      if (habit.lastChecked) {
        const checkedDate = new Date(habit.lastChecked);
        const dayDiff = Math.floor((checkedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          weeklyData[dayDiff]++;
        }
      }
    });

    const maxPossible = Math.max(...weeklyData, 1);
    return weeklyData.map(value => Math.round((value / maxPossible) * 100));
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const tasks = await getUserTasks();
        const habits = await getUserHabits();

        const completedTasks = tasks.filter(task => task.completed).length;
        const activeHabits = habits.length;
        const avgStreak = habits.reduce((acc, habit) => acc + (habit.streak || 0), 0) / (habits.length || 1);
        const weeklyProgress = calculateWeeklyProgress(tasks, habits);
        const categories = habits.reduce((acc, habit) => {
          acc[habit.category] = (acc[habit.category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        setStats({
          tasksCompleted: completedTasks,
          totalTasks: tasks.length,
          habitsActive: activeHabits,
          averageStreak: Math.round(avgStreak),
          weeklyProgress,
          categoryDistribution: categories,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView}>
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={[styles.card, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
              Tasks Completed
            </Text>
            <Text style={[styles.cardValue, { color: theme.colors.text }]}>
              {stats.tasksCompleted}/{stats.totalTasks}
            </Text>
          </View>

          <View style={[styles.card, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
              Active Habits
            </Text>
            <Text style={[styles.cardValue, { color: theme.colors.text }]}>
              {stats.habitsActive}
            </Text>
          </View>

          <View style={[styles.card, { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
              Average Streak
            </Text>
            <Text style={[styles.cardValue, { color: theme.colors.text }]}>
              {stats.averageStreak} days
            </Text>
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={[styles.chartContainer, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Weekly Progress
          </Text>
          <LineChart
            data={progressData}
            width={screenWidth - 100}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix="%"
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            fromZero={true}
          />
        </View>

        {/* Category Distribution Chart */}
        <View style={[styles.chartContainer, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
        }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Habit Categories
          </Text>
          <BarChart
            data={categoryData}
            width={screenWidth - 100}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={30}
            yAxisLabel=""
            yAxisSuffix=" habits"
            showValuesOnTopOfBars
            fromZero={true}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface]}
      style={styles.container}
    >
      {renderContent()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SIZES.xl,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
});

export default StatsScreen; 