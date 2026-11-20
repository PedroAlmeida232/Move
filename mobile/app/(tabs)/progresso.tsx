import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { shortDate } from '../../src/domain/format';
import { dayKey } from '../../src/domain/streak';
import { ACHIEVEMENTS } from '../../src/features/progress/achievements';
import {
  progressOf,
  useProgress,
} from '../../src/features/progress/useProgress';
import { fonts, useTheme } from '../../src/lib/theme';
import { deviceTimeZone, todayKey } from '../../src/lib/time';
import { LoadStatus } from '../../src/lib/ui';

const days = (n: number) => (n === 1 ? '1 dia' : `${n} dias`);

export default function Progresso() {
  const theme = useTheme();
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

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        Progresso
      </Text>
      <LoadStatus
        {...progress}
        loadingText="Carregando progresso…"
        errorText="Não foi possível carregar o progresso. Verifique sua conexão."
      />
      {progress.state.status === 'ready' ? (
        <Content data={progress.state.data} today={today} />
      ) : null}
    </ScrollView>
  );
}

function Content({
  data,
  today,
}: {
  data: Parameters<typeof progressOf>[0];
  today: string;
}) {
  const theme = useTheme();
  const { xp, level, streak, bestStreak, workouts } = progressOf(data, today);
  const unlocked = new Map(
    data.achievements.map((a) => [a.code, a.unlockedAt]),
  );
  const zone = deviceTimeZone();

  return (
    <>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.row}>
          <Text style={[styles.h2, { color: theme.ink }]}>
            Nível {level.index + 1} · {level.name}
          </Text>
          <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
            {xp} XP
          </Text>
        </View>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Progresso do nível"
          accessibilityValue={{ min: 0, max: 100, now: level.pct }}
          style={[styles.track, { backgroundColor: theme.fill }]}
        >
          <View
            style={{
              width: `${level.pct}%`,
              height: '100%',
              backgroundColor: theme.blue,
            }}
          />
        </View>
        <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
          {level.next
            ? `Faltam ${level.xpToNext} XP para ${level.next.name}`
            : 'Nível máximo'}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.stat, { color: theme.ink }]}>
          {streak === 1 ? '1 dia seguido' : `${streak} dias seguidos`}
        </Text>
        <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
          Recorde: {days(bestStreak)}
        </Text>
        <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
          {workouts === 1
            ? '1 treino completo'
            : `${workouts} treinos completos`}
        </Text>
      </View>

      <Text
        accessibilityRole="header"
        style={[styles.h2, { color: theme.ink }]}
      >
        Conquistas {unlocked.size}/{ACHIEVEMENTS.length}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked.get(a.code);
          const status = at
            ? `Desbloqueada em ${shortDate(dayKey(new Date(at), zone))}`
            : 'Bloqueada';
          return (
            <View
              key={a.code}
              accessible
              accessibilityLabel={`${a.name}, ${status.toLowerCase()}. ${a.description}`}
              style={[styles.achievement, { opacity: at ? 1 : 0.5 }]}
            >
              <Text style={[styles.achName, { color: theme.ink }]}>
                {at ? '🏆 ' : '🔒 '}
                {a.name}
              </Text>
              <Text
                style={{
                  color: at ? theme.blue : theme.muted,
                  fontFamily: fonts.native,
                }}
              >
                {status}
              </Text>
              <Text
                style={{
                  color: theme.muted,
                  fontFamily: fonts.native,
                  fontSize: 13,
                }}
              >
                {a.description}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 64, gap: 16 },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  h2: { fontFamily: fonts.native, fontSize: 20, fontWeight: '700' },
  card: { borderRadius: 14, padding: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  stat: { fontFamily: fonts.native, fontSize: 22, fontWeight: '700' },
  achievement: { gap: 2, paddingVertical: 4 },
  achName: { fontFamily: fonts.native, fontSize: 16, fontWeight: '600' },
});
