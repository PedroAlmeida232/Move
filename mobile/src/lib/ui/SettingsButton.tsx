import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { iconSize, radius, touchTarget, useTheme } from '../theme';
import { Icon } from './Icon';

/** Engrenagem no topo das abas: abre os Ajustes. */
export function SettingsButton() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ajustes"
      hitSlop={8}
      onPress={() => router.push('/ajustes')}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.card, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Icon name="settings-outline" color={theme.ink} size={iconSize.md} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
