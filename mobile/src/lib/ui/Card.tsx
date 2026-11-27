import { type ReactNode } from 'react';
import { Animated, StyleSheet, useColorScheme } from 'react-native';

import { useAppear } from '../motion';
import { radius, shadow, space, useTheme } from '../theme';

/** Cartão branco do tema. Entra suave (some e sobe um pouco) ao aparecer. */
export function Card({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  const appear = useAppear();
  return (
    <Animated.View
      testID={testID}
      style={[
        styles.card,
        dark ? shadow.none : shadow.card,
        {
          backgroundColor: theme.card,
          opacity: appear,
          transform: [
            {
              translateY: appear.interpolate({
                inputRange: [0, 1],
                outputRange: [space.sm, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.lg, gap: space.md },
});
