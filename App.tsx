import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { COLORS } from './src/theme/theme';
import { FirebaseProvider, useFirebase } from './src/contexts/FirebaseContext';
import { SafeAreaView } from 'react-native';
import { ThemeProvider } from './src/theme/theme';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { user, loading } = useFirebase();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <FirebaseProvider>
        <SafeAreaView style={{ flex: 1, paddingTop: 20 }}>
          <StatusBar style="light" backgroundColor={COLORS.background} />
          <Navigation />
        </SafeAreaView>
      </FirebaseProvider>
    </ThemeProvider>
  );
}
