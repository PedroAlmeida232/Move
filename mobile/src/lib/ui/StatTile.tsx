import { StyleSheet, Text, View } from 'react-native';

import { fonts, space, type, useTheme } from '../theme';

/** Número grande com o rótulo embaixo. */
export function StatTile({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.tile}
    >
      <Text style={[styles.value, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: space.xs },
  value: { fontFamily: fonts.native, ...type.largeTitle },
  label: { fontFamily: fonts.native, ...type.caption },
});
