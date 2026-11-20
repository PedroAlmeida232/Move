import { Stack } from 'expo-router';

import { AuthProvider, useAuth } from '../src/lib/auth';

function Navigator() {
  const { user, loading } = useAuth();

  // Espera o Firebase informar a sessão para não piscar a tela errada.
  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navigator />
    </AuthProvider>
  );
}
