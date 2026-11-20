import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { formatNumber, shortDate } from '../../domain/format';
import { chartPoints, type WeightEntry } from '../../domain/weight';
import { useTheme } from '../../lib/theme';

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

/** Linha do peso no tempo. `entries` já ordenado por data e com ao menos 1 registro. */
export function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const theme = useTheme();
  const { points } = chartPoints(entries, BOX);
  const line = points
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const last = points[points.length - 1];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={describe(entries)}
      style={{ aspectRatio: BOX.width / BOX.height, width: '100%' }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      >
        <Path d={line} stroke={theme.blue} strokeWidth={2.5} fill="none" />
        {points.slice(0, -1).map((p) => (
          <Circle key={p.date} cx={p.x} cy={p.y} r={3} fill={theme.blue} />
        ))}
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
  );
}
