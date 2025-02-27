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
import { auth, db } from '../config/firebase';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
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

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
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