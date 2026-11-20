import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { weekdayOf } from '../../src/domain/workout';
import { LevelUp } from '../../src/features/progress/LevelUp';
import {
  progressOf,
  useProgress,
  withSession,
} from '../../src/features/progress/useProgress';
import type { WorkoutInput } from '../../src/features/workout/api';
import { TodayWorkout } from '../../src/features/workout/TodayWorkout';
import { usePlan } from '../../src/features/workout/usePlan';
import { fonts, useTheme } from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';
import { LoadStatus } from '../../src/lib/ui';

function Empty({ title, text }: { title: string; text: string }) {
  const theme = useTheme();
  return (
    <>
      <Text style={[styles.h2, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.text, { color: theme.muted }]}>{text}</Text>
    </>
  );
}

export default function Hoje() {
  const theme = useTheme();
  const plan = usePlan();
  const { state } = plan;
  const [todayDate] = useState(todayKey);
  const today = weekdayOf(todayDate);
  const progress = useProgress();
  const [newLevel, setNewLevel] = useState<string | null>(null);

  // Compara o nível antes e depois do treino salvo. Sem histórico carregado, não celebra.
  function onFinished(workout: WorkoutInput) {
    if (progress.state.status !== 'ready') return;
    const data = progress.state.data;
    const before = progressOf(data, todayDate).level;
    const after = progressOf(withSession(data, workout), todayDate).level;
    progress.update((current) => withSession(current, workout));
    if (after.index > before.index) {
      setNewLevel(after.name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  let content = (
    <LoadStatus
      {...plan}
      loadingText="Carregando treino…"
      errorText="Não foi possível carregar o treino. Verifique sua conexão."
    />
  );
  if (state.status === 'ready') {
    const day = state.data.days.find((d) => d.weekday === today);
    if (state.data.days.length === 0) {
      content = (
        <Empty
          title="Sem plano"
          text="Você ainda não tem um plano de treino."
        />
      );
    } else if (!day || day.exercises.length === 0) {
      content = (
        <Empty title="Dia livre" text="Recuperar também faz parte do treino." />
      );
    } else {
      content = (
        <TodayWorkout key={day.weekday} day={day} onFinished={onFinished} />
      );
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        Hoje
      </Text>
      {content}
      <LevelUp level={newLevel} onClose={() => setNewLevel(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 64, gap: 16 },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  h2: { fontFamily: fonts.native, fontSize: 22, fontWeight: '700' },
  text: { fontFamily: fonts.native, fontSize: 16 },
});
