import { Tabs } from 'expo-router';

import { useTheme } from '../../src/lib/theme';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.blue,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: { backgroundColor: theme.card },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="plano" options={{ title: 'Plano' }} />
      <Tabs.Screen name="dieta" options={{ title: 'Dieta' }} />
      <Tabs.Screen name="peso" options={{ title: 'Peso' }} />
    </Tabs>
  );
}
