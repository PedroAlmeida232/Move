import { StyleSheet, Text, View } from 'react-native';

import { missionsPct, type Mission } from '../../domain/today';
import { fonts, space, type, useTheme } from '../../lib/theme';
import { Card } from '../../lib/ui/Card';
import { ProgressRing } from '../../lib/ui/ProgressRing';
import { StatTile } from '../../lib/ui/StatTile';

/** Anel com as missões do dia, sequência e nível. */
export function SummaryCard({
  missions,
  streak,
  level,
}: {
  missions: Mission[];
  streak: number;
  level: string;
}) {
  const theme = useTheme();
  const done = missions.filter((m) => m.done).length;
  return (
    <Card>
      <View style={styles.row}>
        <ProgressRing label="Missões do dia" value={missionsPct(missions)}>
          <Text style={[styles.center, { color: theme.ink }]}>
            {done} de {missions.length}
          </Text>
          <Text style={[styles.caption, { color: theme.muted }]}>missões</Text>
        </ProgressRing>
        <View style={styles.stats}>
          <StatTile
            label="Sequência"
            value={`${streak} ${streak === 1 ? 'dia' : 'dias'}`}
          />
          <StatTile label="Nível" value={level} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  stats: { flex: 1, gap: space.lg },
  center: { fontFamily: fonts.native, ...type.headline, textAlign: 'center' },
  caption: { fontFamily: fonts.native, ...type.caption, textAlign: 'center' },
});
