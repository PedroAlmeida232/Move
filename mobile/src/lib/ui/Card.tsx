import { type ReactNode } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { radius, shadow, space, useTheme } from '../theme';

export function Card({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  return (
    <View
      testID={testID}
      style={[
        styles.card,
        dark ? shadow.none : shadow.card,
        { backgroundColor: theme.card },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.md },
});
