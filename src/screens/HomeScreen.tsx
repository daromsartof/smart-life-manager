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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import Card from '../components/Card';
import CustomButton from '../components/CustomButton';
import { SIZES, SHADOWS, useTheme } from '../theme/theme';
import { useFirebase } from '../contexts/FirebaseContext';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const HomeScreen = () => {
  const { user, getUserTasks, addTask, updateTask, deleteTask } = useFirebase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const userTasks = await getUserTasks();
      setTasks(userTasks);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await addTask({
        title: newTaskTitle,
        completed: false,
        createdAt: new Date(),
      });
      setNewTaskTitle('');
      setIsModalVisible(false);
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean, event: GestureResponderEvent) => {
    // Capture coordinates immediately
    const pageX = event.nativeEvent.pageX;
    const pageY = event.nativeEvent.pageY;
    
    try {
      await updateTask(taskId, { completed: !completed });
      
      // Show confetti when completing a task
      if (!completed) {
        setConfettiPosition({ x: pageX, y: pageY });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.header, {
        shadowColor: theme.colors.primary,
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 12,
      }]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.greeting, { color: 'rgba(255, 255, 255, 0.8)' }]}>Welcome</Text>
        <Text style={[styles.name, { color: '#FFFFFF' }]}>{user?.email}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{tasks.length}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>Tasks Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>
              {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100 || 0)}%
            </Text>
            <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.8)' }]}>Completion</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTaskItem = (task: Task) => (
    <TouchableOpacity
      key={task.id}
      style={[styles.taskItem, { borderBottomColor: theme.colors.border }]}
      onPress={(event: GestureResponderEvent) => handleToggleTask(task.id, task.completed, event)}
      onLongPress={() => {
        Alert.alert(
          'Delete Task',
          'Are you sure you want to delete this task?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => handleDeleteTask(task.id), style: 'destructive' },
          ]
        );
      }}
    >
      <View style={styles.taskCheckbox}>
        {task.completed && (
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
        )}
        {!task.completed && (
          <Ionicons name="ellipse-outline" size={24} color={theme.colors.textSecondary} />
        )}
      </View>
      <Text
        style={[
          styles.taskTitle,
          { color: theme.colors.text },
          task.completed && { color: theme.colors.textSecondary, textDecorationLine: 'line-through' },
        ]}
      >
        {task.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      <ScrollView style={styles.content}>
        <Card style={{
          ...styles.tasksCard,
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
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Today's Tasks</Text>
            <CustomButton
              title="Add Task"
              onPress={() => setIsModalVisible(true)}
              variant="primary"
              size="small"
            />
          </View>
          <View style={styles.tasksList}>
            {loading ? (
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading tasks...</Text>
            ) : tasks.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No tasks for today</Text>
            ) : (
              tasks.map(renderTaskItem)
            )}
          </View>
        </Card>

        <Card variant="glass" style={{
          ...styles.insightsCard,
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
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Daily Insights</Text>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            {tasks.length > 0
              ? `You've completed ${tasks.filter(t => t.completed).length} out of ${tasks.length} tasks today! ${
                  tasks.filter(t => t.completed).length === tasks.length
                    ? '🎉 Great job!'
                    : 'Keep going! 💪'
                }`
              : "Start adding tasks to track your progress! ✨"}
          </Text>
        </Card>
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
          <View style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: '#000000',
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 10,
            }
          ]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Task</Text>
            <TextInput
              style={[styles.input, { 
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background
              }]}
              placeholder="Task title"
              placeholderTextColor={theme.colors.textSecondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />
            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                onPress={() => setIsModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <CustomButton
                title="Add"
                onPress={handleAddTask}
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
    flex: 1
  },
  header: {
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    borderBottomLeftRadius: SIZES.lg,
    borderBottomRightRadius: SIZES.lg,
  },
  headerContent: {
    paddingHorizontal: SIZES.xl,
  },
  greeting: {
    fontSize: SIZES.lg,
    marginBottom: SIZES.xs,
  },
  name: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    marginBottom: SIZES.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: SIZES.md,
    marginTop: SIZES.xs,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  tasksCard: {
    marginBottom: SIZES.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
  },
  tasksList: {
    gap: SIZES.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
  },
  taskCheckbox: {
    marginRight: SIZES.sm,
  },
  taskTitle: {
    fontSize: SIZES.md,
    flex: 1,
  },
  insightsCard: {
    marginBottom: SIZES.lg,
  },
  insightText: {
    fontSize: SIZES.md,
    marginTop: SIZES.sm,
    lineHeight: 24,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SIZES.sm,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default HomeScreen; 