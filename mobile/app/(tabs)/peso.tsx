import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatNumber, shortDate } from '../../src/domain/format';
import { sortByDate, validateWeight } from '../../src/domain/weight';
import { putWeight } from '../../src/features/weight/api';
import { useWeights } from '../../src/features/weight/useWeights';
import { WeightChart } from '../../src/features/weight/WeightChart';
import { fonts, useTheme } from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';
import { ErrorText, Field, LoadStatus, PrimaryButton } from '../../src/lib/ui';

export default function Peso() {
  const theme = useTheme();
  const [today] = useState(todayKey);
  const weights = useWeights(today);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function register() {
    const { error: invalid, kg } = validateWeight(text);
    setError(invalid);
    setSaveError(false);
    if (kg === null) return;

    setBusy(true);
    try {
      const saved = await putWeight(today, kg);
      weights.update((list) =>
        sortByDate([...list.filter((e) => e.date !== saved.date), saved]),
      );
      setText('');
    } catch {
      setSaveError(true);
    }
    setBusy(false);
  }

  const entries = weights.state.status === 'ready' ? weights.state.data : [];
  const last = entries[entries.length - 1];

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        Peso
      </Text>
      <LoadStatus
        {...weights}
        loadingText="Carregando peso…"
        errorText="Não foi possível carregar o peso. Verifique sua conexão."
      />

      {weights.state.status === 'ready' ? (
        <>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {last ? (
              <>
                <Text style={[styles.big, { color: theme.ink }]}>
                  {formatNumber(last.kg)} kg
                </Text>
                <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
                  Último registro em {shortDate(last.date)}
                </Text>
                <WeightChart entries={entries} />
              </>
            ) : (
              <>
                <Text style={[styles.h2, { color: theme.ink }]}>
                  Nenhum peso registrado ainda
                </Text>
                <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
                  Registre o peso uma vez por semana, no mesmo horário, para ver
                  a evolução.
                </Text>
              </>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Field
              label="Peso de hoje (kg)"
              value={text}
              error={error}
              onChangeText={setText}
              keyboardType="decimal-pad"
              placeholder="80,5"
            />
            {saveError ? (
              <ErrorText>
                Não foi possível salvar o peso. Tente de novo.
              </ErrorText>
            ) : null}
            <PrimaryButton
              title="Registrar peso"
              onPress={register}
              busy={busy}
            />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 64, gap: 16 },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  h2: { fontFamily: fonts.native, fontSize: 20, fontWeight: '700' },
  big: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  card: { borderRadius: 14, padding: 16, gap: 12 },
});
