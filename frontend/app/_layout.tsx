import { Stack } from 'expo-router';

export default function Layout() {
  return (
    // headerShown: false yaparak üstte çirkin bir navigasyon barı çıkmasını engelliyoruz
    <Stack screenOptions={{ headerShown: false }} />
  );
}