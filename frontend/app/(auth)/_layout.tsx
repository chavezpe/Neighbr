import React, { useEffect } from 'react';

import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { refreshSession } = useAuth();

  React.useEffect(() => {
    refreshSession();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login-screen" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="create-community" />
    </Stack>
  );
}