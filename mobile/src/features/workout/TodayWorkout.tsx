import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  initialSets,
  setsToPayload,
  workoutProgress,
  type ExerciseSets,
} from '../../domain/workout';
import { fonts, useTheme } from '../../lib/theme';
import { ErrorText, PrimaryButton } from '../../lib/ui';

import { postWorkout, type PlanDay, type WorkoutInput } from './api';

type Save = 'idle' | 'saving' | 'error' | 'saved';

export function TodayWorkout({
  day,
  onFinished,
}: {
  day: PlanDay;
  /** Chamado depois que o treino foi salvo na API. */
  onFinished?: (workout: WorkoutInput) => void;
}) {
  const theme = useTheme();
  const [exercises, setExercises] = useState<ExerciseSets[]>(() =>
    day.exercises.map((e) => ({ exerciseId: e.id, sets: initialSets(e.sets) })),
  );
  const [save, setSave] = useState<Save>('idle');
  const progress = workoutProgress(exercises);

  function update(
    exerciseId: string,
    index: number,
    change: Partial<ExerciseSets['sets'][number]>,
  ) {
    setExercises((current) =>
      current.map((e) =>
        e.exerciseId === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s, i) =>
                i === index ? { ...s, ...change } : s,
              ),
            }
          : e,
      ),
    );
  }

  async function finish() {
    setSave('saving');
    const workout: WorkoutInput = {
      performedAt: new Date().toISOString(),
      finished: true,
      sets: setsToPayload(exercises),
    };
    try {
      await postWorkout(
        workout,
        Object.fromEntries(day.exercises.map((e) => [e.id, e.name])),
      );
    } catch {
      setSave('error');
      return;
    }
    setSave('saved');
    onFinished?.(workout);
  }

  return (
    <View style={styles.stack}>
      <Text
        accessibilityRole="header"
        style={[styles.h2, { color: theme.ink }]}
      >
        {day.name}
      </Text>
      <View
        accessible
        accessibilityLabel="Progresso do treino"
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: progress.pct }}
      >
        <Text style={[styles.small, { color: theme.muted }]}>
          {progress.done} de {progress.total} séries
        </Text>
        <View style={[styles.track, { backgroundColor: theme.fill }]}>
          <View
            style={{
              width: `${progress.pct}%`,
              height: 6,
              backgroundColor: theme.blue,
            }}
          />
        </View>
      </View>

      {day.exercises.map((exercise, ei) => (
        <View
          key={exercise.id}
          style={[styles.card, { backgroundColor: theme.card }]}
        >
          <Text style={[styles.exercise, { color: theme.ink }]}>
            {exercise.name}
          </Text>
          <Text style={[styles.small, { color: theme.muted }]}>
            {exercise.sets} × {exercise.reps}
          </Text>
          {exercises[ei].sets.map((set, i) => (
            <View key={i} style={styles.setRow}>
              <Text style={[styles.setNumber, { color: theme.muted }]}>
                {i + 1}
              </Text>
              <TextInput
                accessibilityLabel={`Carga da série ${i + 1} de ${exercise.name}`}
                placeholder="kg"
                placeholderTextColor={theme.muted}
                keyboardType="decimal-pad"
                value={set.kg}
                editable={save !== 'saved'}
                onChangeText={(kg) => update(exercise.id, i, { kg })}
                style={[
                  styles.input,
                  { backgroundColor: theme.fill, color: theme.ink },
                ]}
              />
              <TextInput
                accessibilityLabel={`Repetições da série ${i + 1} de ${exercise.name}`}
                placeholder={exercise.reps}
                placeholderTextColor={theme.muted}
                keyboardType="number-pad"
                value={set.reps}
                editable={save !== 'saved'}
                onChangeText={(reps) => update(exercise.id, i, { reps })}
                style={[
                  styles.input,
                  { backgroundColor: theme.fill, color: theme.ink },
                ]}
              />
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={`Concluir série ${i + 1} de ${exercise.name}`}
                accessibilityState={{
                  checked: set.done,
                  disabled: save === 'saved',
                }}
                disabled={save === 'saved'}
                onPress={() => update(exercise.id, i, { done: !set.done })}
                hitSlop={6}
                style={[
                  styles.check,
                  {
                    borderColor: theme.blue,
                    backgroundColor: set.done ? theme.blue : 'transparent',
                  },
                ]}
              >
                {set.done ? (
                  <Text style={{ color: theme.onBlue, fontWeight: '700' }}>
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            </View>
          ))}
        </View>
      ))}

      {save === 'error' ? (
        <ErrorText>Não foi possível salvar o treino. Tente de novo.</ErrorText>
      ) : null}
      {save === 'saved' ? (
        <Text
          accessibilityRole="alert"
          style={[styles.done, { color: theme.blue }]}
        >
          Treino concluído!
        </Text>
      ) : (
        <PrimaryButton
          title="Concluir treino"
          onPress={finish}
          busy={save === 'saving'}
          disabled={!progress.complete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  h2: { fontFamily: fonts.native, fontSize: 22, fontWeight: '700' },
  small: { fontFamily: fonts.native, fontSize: 13, marginBottom: 4 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  card: { borderRadius: 14, padding: 14, gap: 8 },
  exercise: { fontFamily: fonts.native, fontSize: 17, fontWeight: '600' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  setNumber: { width: 18, textAlign: 'center', fontFamily: fonts.native },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  check: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  done: {
    fontFamily: fonts.native,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
