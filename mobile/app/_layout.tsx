import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This is the main navigation component. It's NOT exported as default.
function RootLayoutNav() {
  const { authState, login } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        login(token);
      }
    };

    if (!authState.isAuthenticated) {
      checkToken();
    }
  }, []);

  useEffect(() => {
    if (router) {
      const inAuthGroup = segments[0] === '(auth)';

      if (authState.isAuthenticated && inAuthGroup) {
        router.replace('/');
      } else if (!authState.isAuthenticated && !inAuthGroup) {
        router.replace('/login');
      }
    }
  }, [authState.isAuthenticated, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

// This is the main component that wraps everything with providers.
// This is the ONLY default export.
export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <RootLayoutNav />
      </PaperProvider>
    </AuthProvider>
  );
}