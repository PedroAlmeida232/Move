import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { weekdayOf } from '../../src/domain/workout';
import { usePlan } from '../../src/features/workout/usePlan';
import {
  fonts,
  radius,
  space,
  touchTarget,
  type,
  useTheme,
} from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';
import { Card } from '../../src/lib/ui/Card';
import { EmptyState } from '../../src/lib/ui/EmptyState';
import { ErrorState } from '../../src/lib/ui/ErrorState';
import { ListRow } from '../../src/lib/ui/ListRow';
import { Screen } from '../../src/lib/ui/Screen';
import { Skeleton } from '../../src/lib/ui/Skeleton';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Plano() {
  const theme = useTheme();
  const plan = usePlan();
  const [today] = useState(() => weekdayOf(todayKey()));
  const [selected, setSelected] = useState(today);

  let content;
  if (plan.state.status === 'loading') {
    content = <Skeleton height={220} />;
  } else if (plan.state.status === 'error') {
    content = (
      <ErrorState
        message="Não foi possível carregar o treino. Verifique sua conexão."
        onRetry={plan.retry}
      />
    );
  } else {
    const day = plan.state.data.days.find((d) => d.weekday === selected);
    content =
      day && day.exercises.length > 0 ? (
        <View style={styles.section}>
          <Text
            accessibilityRole="header"
            style={[styles.dayName, { color: theme.ink }]}
          >
            {day.name}
          </Text>
          <Card>
            {day.exercises.map((exercise) => (
              <ListRow
                key={exercise.id}
                title={exercise.name}
                value={`${exercise.sets} × ${exercise.reps}`}
              />
            ))}
          </Card>
        </View>
      ) : (
        <EmptyState
          icon="moon-outline"
          title="Dia de descanso"
          message="Recuperar também faz parte do treino."
        />
      );
  }

  return (
    <Screen title="Plano">
      <View style={[styles.week, { backgroundColor: theme.fill }]}>
        {ORDER.map((weekday) => {
          const active = selected === weekday;
          return (
            <Pressable
              key={weekday}
              accessibilityRole="button"
              accessibilityLabel={DAYS[weekday]}
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (!active) Haptics.selectionAsync();
                setSelected(weekday);
              }}
              style={[
                styles.dayButton,
                active && { backgroundColor: theme.card },
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  { color: active ? theme.blue : theme.ink },
                  weekday === today && styles.today,
                ]}
              >
                {DAYS[weekday]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {content}
    </Screen>
  );
}

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: space.xs,
    gap: space.xs,
  },
  dayButton: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: { fontFamily: fonts.native, ...type.callout },
  today: { fontWeight: '700' },
  section: { gap: space.sm },
  dayName: { fontFamily: fonts.native, ...type.title },
});
