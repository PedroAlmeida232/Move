import { StyleSheet, Text, View } from 'react-native';

import { goalPct } from '../../domain/diet';
import { fonts, useTheme } from '../../lib/theme';

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
  color: string;
}) {
  const theme = useTheme();
  const pct = goalPct(value, goal);
  return (
    <View style={styles.goal}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.ink }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.muted }]}>
          {Math.round(value)} / {goal} {unit}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: pct }}
        style={[styles.track, { backgroundColor: theme.fill }]}
      >
        <View
          style={{ width: `${pct}%`, height: '100%', backgroundColor: color }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  goal: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontFamily: fonts.native, fontSize: 15, fontWeight: '600' },
  value: { fontFamily: fonts.native, fontSize: 15 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
});
