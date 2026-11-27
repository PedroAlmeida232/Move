import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { shortDate } from '../../src/domain/format';
import { dayKey } from '../../src/domain/streak';
import { ACHIEVEMENTS } from '../../src/features/progress/achievements';
import {
  progressOf,
  useProgress,
  type ProgressData,
} from '../../src/features/progress/useProgress';
import { fonts, radius, space, type, useTheme } from '../../src/lib/theme';
import { deviceTimeZone, todayKey } from '../../src/lib/time';
import { Card } from '../../src/lib/ui/Card';
import { ErrorState } from '../../src/lib/ui/ErrorState';
import { Icon } from '../../src/lib/ui/Icon';
import { ProgressRing } from '../../src/lib/ui/ProgressRing';
import { Screen } from '../../src/lib/ui/Screen';
import { SettingsButton } from '../../src/lib/ui/SettingsButton';
import { Skeleton } from '../../src/lib/ui/Skeleton';
import { StatTile } from '../../src/lib/ui/StatTile';

const days = (n: number) => (n === 1 ? '1 dia' : `${n} dias`);

export default function Progresso() {
  const [today] = useState(todayKey);
  const progress = useProgress();
  const { refresh } = progress;

  // Ao voltar para a aba, busca de novo (ex.: conquista desbloqueada no treino de hoje).
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );

  let content;
  if (progress.state.status === 'loading') {
    content = (
      <>
        <Skeleton height={160} />
        <Skeleton height={96} />
      </>
    );
  } else if (progress.state.status === 'error') {
    content = (
      <ErrorState
        message="Não foi possível carregar o progresso. Verifique sua conexão."
        onRetry={progress.retry}
      />
    );
  } else {
    content = <Content data={progress.state.data} today={today} />;
  }

  return (
    <Screen title="Progresso" headerRight={<SettingsButton />}>
      {content}
    </Screen>
  );
}

function Content({ data, today }: { data: ProgressData; today: string }) {
  const theme = useTheme();
  const { xp, level, streak, bestStreak, workouts } = progressOf(data, today);
  const unlocked = new Map(
    data.achievements.map((a) => [a.code, a.unlockedAt]),
  );
  const zone = deviceTimeZone();

  return (
    <>
      <Card>
        <View style={styles.level}>
          <ProgressRing label="Progresso do nível" value={level.pct}>
            <Text style={[styles.ringValue, { color: theme.ink }]}>
              {level.pct}%
            </Text>
          </ProgressRing>
          <View style={styles.levelTexts}>
            <Text style={[styles.levelName, { color: theme.ink }]}>
              Nível {level.index + 1} · {level.name}
            </Text>
            <Text style={[styles.xp, { color: theme.blue }]}>{xp} XP</Text>
            <Text style={[styles.callout, { color: theme.muted }]}>
              {level.next
                ? `Faltam ${level.xpToNext} XP para ${level.next.name}`
                : 'Nível máximo'}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.stats}>
          <StatTile label="Sequência atual" value={days(streak)} />
          <StatTile label="Recorde" value={days(bestStreak)} />
          <StatTile label="Treinos completos" value={String(workouts)} />
        </View>
      </Card>

      <Text
        accessibilityRole="header"
        style={[styles.section, { color: theme.ink }]}
      >
        Conquistas {unlocked.size}/{ACHIEVEMENTS.length}
      </Text>
      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked.get(a.code);
          const status = at
            ? `Desbloqueada em ${shortDate(dayKey(new Date(at), zone))}`
            : 'Bloqueada';
          const label = at
            ? `${a.name}. ${status}. ${a.description}`
            : `${a.name}. Bloqueada. Para desbloquear: ${a.description}`;
          return (
            <View
              key={a.code}
              accessible
              accessibilityLabel={label}
              accessibilityState={{ disabled: !at }}
              style={[
                styles.tile,
                { backgroundColor: at ? theme.tint : theme.fill },
              ]}
            >
              <Icon
                name={at ? 'trophy' : 'lock-closed'}
                color={at ? theme.blue : theme.muted}
              />
              <Text
                style={[styles.tileName, { color: at ? theme.ink : theme.muted }]}
              >
                {a.name}
              </Text>
              <Text
                style={[styles.caption, { color: at ? theme.blue : theme.muted }]}
              >
                {at ? status : a.description}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  level: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  levelTexts: { flex: 1, gap: space.xs },
  ringValue: { fontFamily: fonts.native, ...type.title },
  levelName: { fontFamily: fonts.native, ...type.headline },
  xp: { fontFamily: fonts.native, ...type.title },
  callout: { fontFamily: fonts.native, ...type.callout },
  stats: { flexDirection: 'row', gap: space.md },
  section: { fontFamily: fonts.native, ...type.title },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: {
    width: '47%',
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.xs,
  },
  tileName: { fontFamily: fonts.native, ...type.headline },
  caption: { fontFamily: fonts.native, ...type.caption },
});
