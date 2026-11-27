import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { dayMissions, greeting } from '../../src/domain/today';
import { weekdayOf } from '../../src/domain/workout';
import { LevelUp } from '../../src/features/progress/LevelUp';
import {
  progressOf,
  useProgress,
  withSession,
  type ProgressData,
} from '../../src/features/progress/useProgress';
import { MissionsCard } from '../../src/features/today/MissionsCard';
import { SummaryCard } from '../../src/features/today/SummaryCard';
import { WorkoutCard } from '../../src/features/today/WorkoutCard';
import type { Plan, WorkoutInput } from '../../src/features/workout/api';
import { TodayWorkout } from '../../src/features/workout/TodayWorkout';
import { usePlan } from '../../src/features/workout/usePlan';
import { useDisplayName } from '../../src/lib/auth';
import { fonts, type, useTheme } from '../../src/lib/theme';
import { deviceTimeZone, todayKey } from '../../src/lib/time';
import { EmptyState } from '../../src/lib/ui/EmptyState';
import { ErrorState } from '../../src/lib/ui/ErrorState';
import { Screen } from '../../src/lib/ui/Screen';
import { SettingsButton } from '../../src/lib/ui/SettingsButton';
import { Skeleton } from '../../src/lib/ui/Skeleton';

function missionsOf(data: ProgressData, plan: Plan, today: string) {
  const day = plan.days.find((d) => d.weekday === weekdayOf(today));
  return dayMissions({
    today,
    timeZone: deviceTimeZone(),
    trainingDay: !!day && day.exercises.length > 0,
    sessions: data.sessions,
    meals: data.meals.meals,
    weights: data.weights,
    proteinGoal: data.meals.goals.protein,
  });
}

export default function Hoje() {
  const theme = useTheme();
  // O treino vem primeiro: é o que a pessoa veio fazer.
  const plan = usePlan();
  const progress = useProgress();
  const name = useDisplayName();
  const [todayDate] = useState(todayKey);
  const [hour] = useState(() => new Date().getHours());
  const [started, setStarted] = useState(false);
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

  // Resumo e missões: se o histórico falhar, somem sem atrapalhar o treino.
  let summary = null;
  let missionsList = null;
  if (progress.state.status === 'loading') {
    summary = <Skeleton height={152} />;
  } else if (progress.state.status === 'ready' && plan.state.status === 'ready') {
    const data = progress.state.data;
    const missions = missionsOf(data, plan.state.data, todayDate);
    const p = progressOf(data, todayDate);
    summary = (
      <SummaryCard missions={missions} streak={p.streak} level={p.level.name} />
    );
    missionsList = (
      <>
        <Text
          accessibilityRole="header"
          style={[styles.section, { color: theme.ink }]}
        >
          Missões do dia
        </Text>
        <MissionsCard missions={missions} />
      </>
    );
  }

  let workout = null;
  if (plan.state.status === 'loading') {
    workout = <Skeleton height={140} />;
  } else if (plan.state.status === 'error') {
    workout = (
      <ErrorState
        message="Não foi possível carregar o treino. Verifique sua conexão."
        onRetry={plan.retry}
      />
    );
  } else if (plan.state.data.days.length === 0) {
    workout = (
      <EmptyState
        icon="barbell-outline"
        title="Sem plano"
        message="Você ainda não tem um plano de treino."
      />
    );
  } else {
    const day = plan.state.data.days.find(
      (d) => d.weekday === weekdayOf(todayDate),
    );
    if (!day || day.exercises.length === 0) {
      workout = (
        <EmptyState
          icon="moon-outline"
          title="Dia de descanso"
          message="Recuperar também faz parte do treino."
        />
      );
    } else {
      const doneToday =
        progress.state.status === 'ready' &&
        missionsOf(progress.state.data, plan.state.data, todayDate)[0].done;
      workout = (
        <>
          <WorkoutCard
            day={day}
            doneToday={doneToday}
            onStart={started ? undefined : () => setStarted(true)}
          />
          {started ? (
            <TodayWorkout key={day.weekday} day={day} onFinished={onFinished} />
          ) : null}
        </>
      );
    }
  }

  return (
    <Screen title="Hoje" headerRight={<SettingsButton />}>
      <Text style={[styles.greeting, { color: theme.muted }]}>
        {greeting(hour, name)}
      </Text>
      {summary}
      {workout}
      {missionsList}
      <LevelUp level={newLevel} onClose={() => setNewLevel(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: fonts.native, ...type.headline },
  section: { fontFamily: fonts.native, ...type.title },
});
