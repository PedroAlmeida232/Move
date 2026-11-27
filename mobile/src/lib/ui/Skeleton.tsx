import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { duration, useReducedMotion } from '../motion';
import { radius, useTheme } from '../theme';

/** Bloco cinza no lugar do conteúdo que está carregando. Pulsa de leve, exceto com movimento reduzido. */
export function Skeleton({ height }: { height: number }) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduced !== false) return;
    const half = {
      duration: duration.slow,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    };
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { ...half, toValue: 0.5 }),
        Animated.timing(opacity, { ...half, toValue: 1 }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [reduced, opacity]);

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
      accessibilityState={{ busy: true }}
      style={{
        height,
        borderRadius: radius.md,
        backgroundColor: theme.fill,
        opacity,
      }}
    />
  );
}
