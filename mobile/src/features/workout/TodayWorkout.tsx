import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  initialSets,
  setsToPayload,
  workoutProgress,
  type ExerciseSets,
} from '../../domain/workout';
import {
  fonts,
  radius,
  space,
  touchTarget,
  type,
  useTheme,
} from '../../lib/theme';
import { ErrorText } from '../../lib/ui';
import { Button } from '../../lib/ui/Button';
import { Card } from '../../lib/ui/Card';
import { ProgressBar } from '../../lib/ui/ProgressBar';

import { postWorkout, type PlanDay, type WorkoutInput } from './api';
import { SetCheck } from './SetCheck';

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
      await postWorkout(workout);
    } catch {
      setSave('error');
      return;
    }
    setSave('saved');
    onFinished?.(workout);
  }

  return (
    <View style={styles.stack}>
      <View style={styles.progress}>
        <Text style={[styles.caption, { color: theme.muted }]}>
          {progress.done} de {progress.total} séries
        </Text>
        <ProgressBar label="Progresso do treino" value={progress.pct} />
      </View>

      {day.exercises.map((exercise, ei) => (
        <Card key={exercise.id} testID={`exercicio-${exercise.id}`}>
          <View>
            <Text style={[styles.exercise, { color: theme.ink }]}>
              {exercise.name}
            </Text>
            <Text style={[styles.caption, { color: theme.muted }]}>
              {exercise.sets} × {exercise.reps}
            </Text>
          </View>
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
              <SetCheck
                label={`Concluir série ${i + 1} de ${exercise.name}`}
                checked={set.done}
                disabled={save === 'saved'}
                onToggle={() => update(exercise.id, i, { done: !set.done })}
              />
            </View>
          ))}
        </Card>
      ))}

      {save === 'error' ? (
        <ErrorText>Não foi possível salvar o treino. Tente de novo.</ErrorText>
      ) : null}
      {save === 'saved' ? (
        <Text
          accessibilityRole="alert"
          style={[styles.done, { color: theme.sucesso }]}
        >
          Treino concluído!
        </Text>
      ) : (
        <Button
          title="Concluir treino"
          onPress={finish}
          loading={save === 'saving'}
          disabled={!progress.complete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  progress: { gap: space.xs },
  caption: { fontFamily: fonts.native, ...type.caption },
  exercise: { fontFamily: fonts.native, ...type.headline },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  setNumber: {
    width: space.lg,
    textAlign: 'center',
    fontFamily: fonts.native,
    ...type.callout,
  },
  input: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontFamily: fonts.native,
    ...type.body,
  },
  done: { fontFamily: fonts.native, ...type.title, textAlign: 'center' },
});
