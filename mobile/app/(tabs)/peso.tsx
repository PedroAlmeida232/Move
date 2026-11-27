import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '../../src/domain/format';
import {
  sortByDate,
  validateWeight,
  weightChange,
  type WeightRange,
} from '../../src/domain/weight';
import { putWeight, type WeightRecord } from '../../src/features/weight/api';
import { useWeights } from '../../src/features/weight/useWeights';
import { WeightChart } from '../../src/features/weight/WeightChart';
import {
  fonts,
  radius,
  space,
  touchTarget,
  type,
  useTheme,
} from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';
import { ErrorText, Field } from '../../src/lib/ui';
import { Button } from '../../src/lib/ui/Button';
import { Card } from '../../src/lib/ui/Card';
import { EmptyState } from '../../src/lib/ui/EmptyState';
import { ErrorState } from '../../src/lib/ui/ErrorState';
import { Screen } from '../../src/lib/ui/Screen';
import { Sheet } from '../../src/lib/ui/Sheet';
import { Skeleton } from '../../src/lib/ui/Skeleton';
import { StatTile } from '../../src/lib/ui/StatTile';

const RANGES: { key: WeightRange; label: string; period: string }[] = [
  { key: '30d', label: '30 dias', period: 'em 30 dias' },
  { key: '90d', label: '90 dias', period: 'em 90 dias' },
  { key: 'all', label: 'Tudo', period: 'no total' },
];

export default function Peso() {
  const theme = useTheme();
  const [today] = useState(todayKey);
  const [range, setRange] = useState<WeightRange>('90d');
  const weights = useWeights(today, range);
  const [open, setOpen] = useState(false);

  function choose(next: WeightRange) {
    if (next === range) return;
    Haptics.selectionAsync();
    setRange(next);
    weights.refresh();
  }

  let content;
  if (weights.state.status === 'loading') {
    content = <Skeleton height={260} />;
  } else if (weights.state.status === 'error') {
    content = (
      <ErrorState
        message="Não foi possível carregar o peso. Verifique sua conexão."
        onRetry={weights.retry}
      />
    );
  } else {
    const entries = weights.state.data;
    const last = entries[entries.length - 1];
    const change = weightChange(entries);
    const period = RANGES.find((r) => r.key === range)!.period;
    content = last ? (
      <Card>
        <View style={styles.stats}>
          <StatTile label="Peso atual" value={`${formatNumber(last.kg)} kg`} />
          <StatTile
            label={`Variação ${period}`}
            value={change.text}
            color={
              change.tone === 'loss'
                ? theme.sucesso
                : change.tone === 'gain'
                  ? theme.ink
                  : theme.muted
            }
          />
        </View>
        <WeightChart entries={entries} />
      </Card>
    ) : (
      <EmptyState
        icon="scale-outline"
        title="Nenhum peso registrado ainda"
        message="Registre o peso uma vez por semana, no mesmo horário, para ver a evolução."
      />
    );
  }

  return (
    <Screen title="Peso">
      <View style={[styles.segments, { backgroundColor: theme.fill }]}>
        {RANGES.map((r) => {
          const active = r.key === range;
          return (
            <Pressable
              key={r.key}
              accessibilityRole="button"
              accessibilityLabel={r.label}
              accessibilityState={{ selected: active }}
              onPress={() => choose(r.key)}
              style={[styles.segment, active && { backgroundColor: theme.card }]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  { color: active ? theme.blue : theme.ink },
                ]}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {content}
      {weights.state.status === 'ready' ? (
        <>
          <Button title="Registrar peso" onPress={() => setOpen(true)} />
          <WeightSheet
            visible={open}
            date={today}
            onClose={() => setOpen(false)}
            onSaved={(saved) => {
              weights.update((list) =>
                sortByDate([
                  ...list.filter((e) => e.date !== saved.date),
                  saved,
                ]),
              );
              setOpen(false);
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}

function WeightSheet({
  visible,
  date,
  onClose,
  onSaved,
}: {
  visible: boolean;
  date: string;
  onClose: () => void;
  onSaved: (saved: WeightRecord) => void;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);

  function close() {
    setText('');
    setError(null);
    setSaveError(false);
    onClose();
  }

  async function save() {
    const { error: invalid, kg } = validateWeight(text);
    setError(invalid);
    setSaveError(false);
    if (kg === null) return;

    setBusy(true);
    try {
      const saved = await putWeight(date, kg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setText('');
      onSaved(saved);
    } catch {
      setSaveError(true);
    }
    setBusy(false);
  }

  return (
    <Sheet visible={visible} title="Registrar peso" onClose={close}>
      <Field
        label="Peso de hoje (kg)"
        value={text}
        error={error}
        onChangeText={setText}
        keyboardType="decimal-pad"
        placeholder="80,5"
        autoFocus
      />
      {saveError ? (
        <ErrorText>Não foi possível salvar o peso. Tente de novo.</ErrorText>
      ) : null}
      <Button title="Salvar peso" onPress={save} loading={busy} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.lg },
  segments: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: space.xs,
    gap: space.xs,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: { fontFamily: fonts.native, ...type.callout },
});
