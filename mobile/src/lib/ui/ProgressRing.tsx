import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { space, useTheme } from '../theme';
import { percentA11y, toPercent } from './percent';

const STROKE = space.md;

/** Anel de progresso; `value` em porcentagem. `children` fica no centro. */
export function ProgressRing({
  label,
  value,
  size = 120,
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
  const pct = toPercent(value);
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
          <Circle
            {...circle}
            stroke={color ?? theme.blue}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[length, length]}
            strokeDashoffset={length * (1 - pct / 100)}
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
