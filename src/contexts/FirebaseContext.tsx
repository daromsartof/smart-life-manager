import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';

const AUTH_USER_KEY = '@auth_user';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  addTask: (task: any) => Promise<void>;
  updateTask: (taskId: string, data: any) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addHabit: (habit: any) => Promise<void>;
  updateHabit: (habitId: string, data: any) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  getUserTasks: () => Promise<any[]>;
  getUserHabits: () => Promise<any[]>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored user on mount
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      }
    };

    loadStoredUser();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      try {
        if (currentUser) {
          // Store user data when signed in
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
        } else {
          // Remove stored user data when signed out
          await AsyncStorage.removeItem(AUTH_USER_KEY);
        }
      } catch (error) {
        console.error('Error storing auth state:', error);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    try {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userCredential.user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userCredential.user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const addTask = async (task: any) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      ...task,
      userId: user.uid,
      createdAt: new Date(),
    });
  };

  const updateTask = async (taskId: string, data: any) => {
    await updateDoc(doc(db, 'tasks', taskId), data);
  };

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const addHabit = async (habit: any) => {
    if (!user) return;
    await addDoc(collection(db, 'habits'), {
      ...habit,
      userId: user.uid,
      createdAt: new Date(),
    });
  };

  const updateHabit = async (habitId: string, data: any) => {
    await updateDoc(doc(db, 'habits', habitId), data);
  };

  const deleteHabit = async (habitId: string) => {
    await deleteDoc(doc(db, 'habits', habitId));
  };

  const getUserTasks = async () => {
    if (!user) return [];
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const getUserHabits = async () => {
    if (!user) return [];
    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const value: FirebaseContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getUserTasks,
    addTask,
    updateTask,
    deleteTask,
    getUserHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}; 