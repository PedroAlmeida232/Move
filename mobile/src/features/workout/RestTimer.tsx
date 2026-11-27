import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatClock } from '../../domain/workout';
import { fonts, radius, space, type, useTheme } from '../../lib/theme';
import { Button } from '../../lib/ui/Button';
import { Icon } from '../../lib/ui/Icon';

export const REST_SECONDS = 90;

/** Contagem do descanso entre séries. Vibra ao terminar e avisa quem a abriu. */
export function RestTimer({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const [left, setLeft] = useState(REST_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (left > 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDone();
  }, [left, onDone]);

  return (
    <View style={[styles.bar, { backgroundColor: theme.tint }]}>
      <Icon name="timer-outline" color={theme.blue} />
      <Text
        accessibilityRole="timer"
        accessibilityLabel={`Descanso: ${formatClock(left)}`}
        accessibilityLiveRegion="polite"
        style={[styles.clock, { color: theme.ink }]}
      >
        Descanso {formatClock(left)}
      </Text>
      <View style={styles.skip}>
        <Button title="Pular descanso" variant="text" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.md,
    paddingLeft: space.md,
  },
  clock: { flex: 1, fontFamily: fonts.native, ...type.headline },
  skip: { flexShrink: 0 },
});
