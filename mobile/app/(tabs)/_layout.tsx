import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';

import { Icon, type IconName } from '../../src/lib/ui/Icon';
import { fonts, useTheme } from '../../src/lib/theme';

// Ícone preenchido na aba ativa; a versão "-outline" nas outras.
export const TAB_ICONS = {
  index: 'today',
  plano: 'barbell',
  dieta: 'restaurant',
  peso: 'scale',
  progresso: 'trophy',
} as const satisfies Record<string, IconName>;

export function tabIcon(route: string, focused: boolean): IconName {
  const base = TAB_ICONS[route as keyof typeof TAB_ICONS];
  return (focused ? base : `${base}-outline`) as IconName;
}

const ABAS = [
  { name: 'index', title: 'Hoje' },
  { name: 'plano', title: 'Plano' },
  { name: 'dieta', title: 'Dieta' },
  { name: 'peso', title: 'Peso' },
  { name: 'progresso', title: 'Progresso' },
] as const;

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync();
        },
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.blue,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.sep,
        },
        tabBarLabelStyle: { fontFamily: fonts.native },
        tabBarIcon: ({ focused, color, size }) => (
          <Icon name={tabIcon(route.name, focused)} color={color as string} size={size} />
        ),
      })}
    >
      {ABAS.map((aba) => (
        <Tabs.Screen
          key={aba.name}
          name={aba.name}
          options={{ title: aba.title, tabBarAccessibilityLabel: aba.title }}
        />
      ))}
    </Tabs>
  );
}
