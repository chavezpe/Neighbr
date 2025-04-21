import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'white',
          },
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login-screen" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="create-community" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="community-details" />
      </Stack>
    </>
  );
}