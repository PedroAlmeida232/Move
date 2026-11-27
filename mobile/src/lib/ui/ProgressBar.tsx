import { StyleSheet, View } from 'react-native';

import { radius, space, useTheme } from '../theme';
import { percentA11y, toPercent } from './percent';

/** Barra de progresso; `value` em porcentagem. */
export function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const theme = useTheme();
  const pct = toPercent(value);
  return (
    <View
      {...percentA11y(label, pct)}
      style={[styles.track, { backgroundColor: theme.fill }]}
    >
      <View
        style={[
          styles.bar,
          { width: `${pct}%`, backgroundColor: color ?? theme.blue },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: space.sm, borderRadius: radius.full, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: radius.full },
});
