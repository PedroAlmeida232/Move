import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { formatNumber, shortDate } from '../../domain/format';
import { chartPoints, type ChartPoint, type WeightEntry } from '../../domain/weight';
import { fonts, space, type, useTheme } from '../../lib/theme';

const BOX = { width: 340, height: 150, padding: 14 };

function describe(entries: WeightEntry[]): string {
  const first = entries[0];
  const last = entries[entries.length - 1];
  const count =
    entries.length === 1 ? '1 registro' : `${entries.length} registros`;
  return (
    `Gráfico de peso: ${count}, de ${formatNumber(first.kg)} kg em ${shortDate(first.date)}` +
    ` a ${formatNumber(last.kg)} kg em ${shortDate(last.date)}`
  );
}

/** Curva suave pelos pontos: cada trecho é uma cúbica com controles no meio do caminho. */
function smoothPath(points: ChartPoint[]): string {
  return points
    .map((p, i) => {
      if (i === 0) return `M${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const prev = points[i - 1];
      const mid = ((prev.x + p.x) / 2).toFixed(1);
      return `C${mid} ${prev.y.toFixed(1)} ${mid} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(' ');
}

/** Linha do peso no tempo. `entries` já ordenado por data e com ao menos 1 registro. */
export function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const theme = useTheme();
  const { points, min, max } = chartPoints(entries, BOX);
  const last = points[points.length - 1];
  const bottom = BOX.height - BOX.padding;

  return (
    <View style={styles.wrap}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={describe(entries)}
        style={styles.chart}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${BOX.width} ${BOX.height}`}
        >
          {[BOX.padding, BOX.height / 2, bottom].map((y) => (
            <Line
              key={y}
              x1={0}
              x2={BOX.width}
              y1={y}
              y2={y}
              stroke={theme.sep}
              strokeWidth={1}
            />
          ))}
          <Path
            d={smoothPath(points)}
            stroke={theme.blue}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={last.x} cy={last.y} r={9} fill={theme.tint} />
          <Circle
            cx={last.x}
            cy={last.y}
            r={5}
            fill={theme.blue}
            stroke={theme.card}
            strokeWidth={2}
          />
        </Svg>
      </View>
      <View style={styles.axis} importantForAccessibility="no-hide-descendants">
        <Text style={[styles.tick, { color: theme.muted }]}>
          {shortDate(entries[0].date)}
        </Text>
        <Text style={[styles.tick, { color: theme.muted }]}>
          {formatNumber(min)}–{formatNumber(max)} kg
        </Text>
        <Text style={[styles.tick, { color: theme.muted }]}>
          {shortDate(entries[entries.length - 1].date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  chart: { aspectRatio: BOX.width / BOX.height, width: '100%' },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  tick: { fontFamily: fonts.native, ...type.caption },
});
