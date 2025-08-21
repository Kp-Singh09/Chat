import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  // This Stack navigator controls the screens INSIDE the (app) group.
  // By setting headerShown to false here, we hide the header for all
  // screens in this group, including the chat screen.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="chat/[id]" />
    </Stack>
  );
}