import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Log In',
        }}
      />
      <Stack.Screen
        name="success"
        options={{
          title: 'Success',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
