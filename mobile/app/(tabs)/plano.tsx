import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { weekdayOf } from '../../src/domain/workout';
import { PlanStatus } from '../../src/features/workout/PlanState';
import { usePlan } from '../../src/features/workout/usePlan';
import { fonts, useTheme } from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Plano() {
  const theme = useTheme();
  const plan = usePlan();
  const [selected, setSelected] = useState(() => weekdayOf(todayKey()));

  const day =
    plan.state.status === 'ready'
      ? plan.state.plan.days.find((d) => d.weekday === selected)
      : undefined;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        Plano
      </Text>
      <View accessibilityRole="tablist" style={styles.week}>
        {ORDER.map((weekday) => (
          <Pressable
            key={weekday}
            accessibilityRole="button"
            accessibilityLabel={DAYS[weekday]}
            accessibilityState={{ selected: selected === weekday }}
            onPress={() => setSelected(weekday)}
            style={[
              styles.dayButton,
              {
                backgroundColor: selected === weekday ? theme.blue : theme.fill,
              },
            ]}
          >
            <Text
              style={{
                color: selected === weekday ? theme.onBlue : theme.ink,
                fontFamily: fonts.native,
              }}
            >
              {DAYS[weekday]}
            </Text>
          </Pressable>
        ))}
      </View>

      <PlanStatus {...plan} />

      {plan.state.status === 'ready' ? (
        day && day.exercises.length > 0 ? (
          <View style={styles.list}>
            <Text style={[styles.h2, { color: theme.ink }]}>{day.name}</Text>
            {day.exercises.map((exercise) => (
              <View
                key={exercise.id}
                style={[styles.card, { backgroundColor: theme.card }]}
              >
                <Text style={[styles.exercise, { color: theme.ink }]}>
                  {exercise.name}
                </Text>
                <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
                  {exercise.sets} × {exercise.reps}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.h2, { color: theme.ink }]}>Descanso</Text>
        )
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 64, gap: 16 },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  week: { flexDirection: 'row', gap: 6 },
  dayButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: 10 },
  h2: { fontFamily: fonts.native, fontSize: 22, fontWeight: '700' },
  card: { borderRadius: 14, padding: 14, gap: 4 },
  exercise: { fontFamily: fonts.native, fontSize: 17, fontWeight: '600' },
});
