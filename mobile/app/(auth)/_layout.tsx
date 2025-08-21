import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  // This Stack navigator controls the screens INSIDE the (auth) group
  // and hides the header for all of them.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}