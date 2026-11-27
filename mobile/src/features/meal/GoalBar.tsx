import { StyleSheet, Text, View } from 'react-native';

import { goalPct } from '../../domain/diet';
import { fonts, space, type, useTheme } from '../../lib/theme';
import { ProgressBar } from '../../lib/ui/ProgressBar';

export function GoalBar({
  label,
  value,
  goal,
  unit,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.goal}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.ink }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.muted }]}>
          {Math.round(value)} / {goal} {unit}
        </Text>
      </View>
      <ProgressBar label={label} value={goalPct(value, goal)} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  goal: { gap: space.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontFamily: fonts.native, ...type.callout, fontWeight: '600' },
  value: { fontFamily: fonts.native, ...type.callout },
});
