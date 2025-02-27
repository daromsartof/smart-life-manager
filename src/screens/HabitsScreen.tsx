import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import { SIZES, SHADOWS, useTheme } from '../theme/theme';
import { useFirebase } from '../contexts/FirebaseContext';

interface Habit {
  id: string;
  title: string;
  streak: number;
  target: number;
  progress: number;
  category: 'health' | 'productivity' | 'mindfulness' | 'fitness';
  lastChecked?: Date;
}

type NewHabit = {
  title: string;
  target: string;
  category: Habit['category'];
};

const HabitsScreen = () => {
  const { getUserHabits, addHabit, updateHabit, deleteHabit } = useFirebase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const confettiRef = useRef<any>(null);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [newHabit, setNewHabit] = useState<NewHabit>({
    title: '',
    target: '30',
    category: 'productivity',
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const userHabits = await getUserHabits();
      setHabits(userHabits);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load habits');
    }
  };

  const handleAddHabit = async () => {
    if (!newHabit.title.trim()) return;

    try {
      await addHabit({
        title: newHabit.title,
        target: parseInt(newHabit.target),
        category: newHabit.category,
        streak: 0,
        progress: 0,
      });
      setNewHabit({ title: '', target: '30', category: 'productivity' });
      setIsModalVisible(false);
      loadHabits();
    } catch (error) {
      Alert.alert('Error', 'Failed to add habit');
    }
  };

  const handleCheckIn = async (habit: Habit, event: GestureResponderEvent) => {
    try {
      const now = new Date();
      const lastChecked = habit.lastChecked ? new Date(habit.lastChecked) : null;
      const isNewDay = !lastChecked || 
        lastChecked.getDate() !== now.getDate() ||
        lastChecked.getMonth() !== now.getMonth() ||
        lastChecked.getFullYear() !== now.getFullYear();

      if (isNewDay) {
        const newProgress = habit.progress + 1;
        const newStreak = newProgress >= habit.target ? habit.streak + 1 : habit.streak;
        
        await updateHabit(habit.id, {
          progress: newProgress,
          streak: newStreak,
          lastChecked: now,
        });
        
        // Trigger confetti
        const { pageX, pageY } = event.nativeEvent;
        setConfettiPosition({ x: pageX, y: pageY });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        
        loadHabits();
      } else {
        Alert.alert('Already Checked', 'You have already checked in today!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      loadHabits();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete habit');
    }
  };

  const renderHabitCard = (habit: Habit) => {
    const progress = (habit.progress / habit.target) * 100;
    
    return (
      <Card key={habit.id} style={{
        ...styles.habitCard,
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.text,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}>
        <View style={styles.habitHeader}>
          <View style={styles.habitTitleContainer}>
            <View style={[styles.categoryIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons
                name={getCategoryIcon(habit.category)}
                size={20}
                color={theme.colors.text}
              />
            </View>
            <View>
              <Text style={[styles.habitTitle, { color: theme.colors.text }]}>{habit.title}</Text>
              <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>{habit.category}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Habit',
                'Are you sure you want to delete this habit?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: () => handleDeleteHabit(habit.id), style: 'destructive' },
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.streakContainer}>
          <Ionicons name="flame" size={20} color={theme.colors.warning} />
          <Text style={[styles.streakText, { color: theme.colors.textSecondary }]}>{habit.streak} days streak</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[styles.progressFill, { 
                width: `${progress}%`,
                backgroundColor: theme.colors.primary
              }]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {habit.progress}/{habit.target} days
          </Text>
        </View>

        <CustomButton
          title="Check In"
          onPress={(event: GestureResponderEvent) => {
            handleCheckIn(habit, event)
          }}
          variant="primary"
          size="small"
        />
      </Card>
    );
  };

  const getCategoryIcon = (category: Habit['category']) => {
    switch (category) {
      case 'health':
        return 'heart';
      case 'productivity':
        return 'rocket';
      case 'mindfulness':
        return 'leaf';
      case 'fitness':
        return 'fitness';
      default:
        return 'star';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.text,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>My Habits</Text>
        <CustomButton
          title="Add Habit"
          onPress={() => setIsModalVisible(true)}
          variant="primary"
          size="small"
        />
      </View>

      <ScrollView style={styles.content}>
        <Card variant="glass" style={{
          ...styles.statsCard,
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.text,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Weekly Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{habits.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Active Habits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {Math.round(
                  (habits.reduce((acc, h) => acc + h.streak, 0) / habits.length) || 0
                )}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avg Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {Math.max(...habits.map(h => h.streak), 0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Best Streak</Text>
            </View>
          </View>
        </Card>

        <View style={styles.habitsList}>
          {loading ? (
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading habits...</Text>
          ) : habits.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No habits yet. Start building some!</Text>
          ) : (
            habits.map(renderHabitCard)
          )}
        </View>
      </ScrollView>

      {showConfetti && (
        <View style={StyleSheet.absoluteFill}>
          <ConfettiCannon
            count={50}
            origin={{ x: confettiPosition.x, y: confettiPosition.y }}
            autoStart={true}
            fadeOut={true}
            colors={[
              theme.colors.primary,
              theme.colors.secondary,
              theme.colors.success,
              theme.colors.warning,
              '#FFD700', // Gold
              '#FF69B4', // Pink
              '#00FFFF', // Cyan
            ]}
          />
        </View>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { 
            backgroundColor: theme.colors.surface,
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 10,
          }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create New Habit</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background
              }]}
              placeholder="Habit name"
              placeholderTextColor={theme.colors.textSecondary}
              value={newHabit.title}
              onChangeText={(text) => setNewHabit(prev => ({ ...prev, title: text }))}
            />
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background
              }]}
              placeholder="Target (days)"
              placeholderTextColor={theme.colors.textSecondary}
              value={newHabit.target}
              onChangeText={(text) => setNewHabit(prev => ({ ...prev, target: text }))}
              keyboardType="numeric"
            />
            <View style={styles.categorySelector}>
              <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>Category:</Text>
              {(['health', 'productivity', 'mindfulness', 'fitness'] as const).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    { borderColor: theme.colors.border },
                    newHabit.category === category && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setNewHabit(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    { color: theme.colors.text },
                    newHabit.category === category && { color: '#FFFFFF' }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => setIsModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <CustomButton
                title="Add"
                onPress={handleAddHabit}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  statsCard: {
    marginBottom: SIZES.xl,
  },
  statsTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    marginBottom: SIZES.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: SIZES.sm,
    marginTop: SIZES.xs,
  },
  habitsList: {
    gap: SIZES.md,
  },
  habitCard: {
    marginBottom: SIZES.md,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  habitTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  habitTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: SIZES.sm,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  streakText: {
    marginLeft: SIZES.xs,
    fontSize: SIZES.sm,
  },
  progressContainer: {
    marginBottom: SIZES.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SIZES.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: SIZES.sm,
  },
  loadingText: {
    textAlign: 'center',
    padding: SIZES.md,
  },
  emptyText: {
    textAlign: 'center',
    padding: SIZES.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: SIZES.xl,
    borderRadius: SIZES.lg,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SIZES.lg,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: SIZES.sm,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.lg,
  },
  categorySelector: {
    marginBottom: SIZES.lg,
  },
  categoryLabel: {
    fontSize: SIZES.md,
    marginBottom: SIZES.sm,
  },
  categoryButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.sm,
    borderWidth: 1,
    marginBottom: SIZES.xs,
  },
  categoryButtonText: {
    fontSize: SIZES.md,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SIZES.sm,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default HabitsScreen; 