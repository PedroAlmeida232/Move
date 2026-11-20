import { ScrollView, StyleSheet, Text } from 'react-native';

import { weekdayOf } from '../../src/domain/workout';
import { PlanStatus } from '../../src/features/workout/PlanState';
import { TodayWorkout } from '../../src/features/workout/TodayWorkout';
import { usePlan } from '../../src/features/workout/usePlan';
import { fonts, useTheme } from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';

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
  const today = weekdayOf(todayKey());

  let content = <PlanStatus {...plan} />;
  if (state.status === 'ready') {
    const day = state.plan.days.find((d) => d.weekday === today);
    if (state.plan.days.length === 0) {
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
      content = <TodayWorkout key={day.weekday} day={day} />;
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 64, gap: 16 },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  h2: { fontFamily: fonts.native, fontSize: 22, fontWeight: '700' },
  text: { fontFamily: fonts.native, fontSize: 16 },
});
