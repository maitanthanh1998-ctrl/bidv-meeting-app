import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';

// Polyfill fetch to prevent Supabase from trying to import @supabase/node-fetch
// This is a no-op in React Native where fetch already exists
if (typeof globalThis.fetch === 'undefined') {
  // @ts-ignore
  globalThis.fetch = fetch;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}