import { type ReactNode } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { duration, useAppear } from '../motion';
import { space, useTheme } from '../theme';
import { percentA11y, toPercent } from './percent';

const STROKE = space.md;
// Com a fonte grande do iPhone, o anel cresce junto (até este limite) para o centro caber.
const MAX_GROWTH = 1.5;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Anel de progresso; `value` em porcentagem. `children` fica no centro. */
export function ProgressRing({
  label,
  value,
  size: base = 120,
  color,
  children,
}: {
  label: string;
  value: number;
  size?: number;
  color?: string;
  children?: ReactNode;
}) {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();
  const size = Math.round(base * Math.min(Math.max(fontScale, 1), MAX_GROWTH));
  const pct = toPercent(value);
  // O anel enche do zero até o valor; o leitor de tela já recebe o valor final.
  const fill = useAppear(duration.slow);
  const center = size / 2;
  const r = (size - STROKE) / 2;
  const length = 2 * Math.PI * r;
  const circle = { cx: center, cy: center, r, strokeWidth: STROKE };
  return (
    <View
      {...percentA11y(label, pct)}
      style={[styles.ring, { width: size, height: size }]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle {...circle} stroke={theme.fill} fill="none" />
        {pct > 0 ? (
          <AnimatedCircle
            testID="anel-preenchimento"
            {...circle}
            stroke={color ?? theme.blue}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[length, length]}
            strokeDashoffset={fill.interpolate({
              inputRange: [0, 1],
              outputRange: [length, length * (1 - pct / 100)],
            })}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
});
