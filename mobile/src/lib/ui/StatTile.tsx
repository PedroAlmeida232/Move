import { StyleSheet, Text, View } from 'react-native';

import { fonts, space, type, useTheme } from '../theme';

/** Número grande com o rótulo embaixo. */
export function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  /** Cor do número; sem ela, a cor do texto. */
  color?: string;
}) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={styles.tile}
    >
      <Text
        maxFontSizeMultiplier={1.4}
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.value, { color: color ?? theme.ink }]}
      >
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: space.xs },
  value: { fontFamily: fonts.native, ...type.largeTitle },
  label: { fontFamily: fonts.native, ...type.caption },
});
