import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { dayTotals, validateMeal, type MealForm } from '../../src/domain/diet';
import { formatNumber } from '../../src/domain/format';
import { getMeals, postMeal } from '../../src/features/meal/api';
import { GoalBar } from '../../src/features/meal/GoalBar';
import { fonts, useTheme } from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';
import { ErrorText, Field, LoadStatus, PrimaryButton } from '../../src/lib/ui';
import { useResource } from '../../src/lib/useResource';

const EMPTY: MealForm = { name: '', kcal: '', protein: '', carbs: '', fat: '' };

const FIELDS: { key: keyof MealForm; label: string; numeric: boolean }[] = [
  { key: 'name', label: 'Nome', numeric: false },
  { key: 'kcal', label: 'Calorias (kcal)', numeric: true },
  { key: 'protein', label: 'Proteína (g)', numeric: true },
  { key: 'carbs', label: 'Carboidratos (g)', numeric: true },
  { key: 'fat', label: 'Gorduras (g)', numeric: true },
];

export default function Dieta() {
  const theme = useTheme();
  const [today] = useState(todayKey);
  const day = useResource(() => getMeals(today));
  const [form, setForm] = useState<MealForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof MealForm, string>>>(
    {},
  );
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function add() {
    const { errors: found, meal } = validateMeal(form);
    setErrors(found);
    setSaveError(false);
    if (!meal) return;

    setBusy(true);
    try {
      const saved = await postMeal({ ...meal, date: today });
      day.update((data) => ({ ...data, meals: [...data.meals, saved] }));
      setForm(EMPTY);
    } catch {
      setSaveError(true);
    }
    setBusy(false);
  }

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
        Dieta
      </Text>
      <LoadStatus
        {...day}
        loadingText="Carregando refeições…"
        errorText="Não foi possível carregar as refeições. Verifique sua conexão."
      />

      {day.state.status === 'ready' ? (
        <>
          <Summary data={day.state.data} />

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.h2, { color: theme.ink }]}>
              Adicionar refeição
            </Text>
            {FIELDS.map(({ key, label, numeric }) => (
              <Field
                key={key}
                label={label}
                value={form[key]}
                error={errors[key]}
                onChangeText={(text) => setForm((f) => ({ ...f, [key]: text }))}
                keyboardType={numeric ? 'decimal-pad' : 'default'}
              />
            ))}
            {saveError ? (
              <ErrorText>
                Não foi possível salvar a refeição. Tente de novo.
              </ErrorText>
            ) : null}
            <PrimaryButton
              title="Adicionar refeição"
              onPress={add}
              busy={busy}
            />
          </View>

          <MealList meals={day.state.data.meals} />
        </>
      ) : null}
    </ScrollView>
  );
}

function Summary({ data }: { data: Awaited<ReturnType<typeof getMeals>> }) {
  const theme = useTheme();
  const totals = dayTotals(data.meals);
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <GoalBar
        label="Calorias"
        value={totals.kcal}
        goal={data.goals.kcal}
        unit="kcal"
        color={theme.r3}
      />
      <GoalBar
        label="Proteína"
        value={totals.protein}
        goal={data.goals.protein}
        unit="g"
        color={theme.blue}
      />
      <GoalBar
        label="Carboidratos"
        value={totals.carbs}
        goal={data.goals.carbs}
        unit="g"
        color={theme.r2}
      />
      <GoalBar
        label="Gorduras"
        value={totals.fat}
        goal={data.goals.fat}
        unit="g"
        color={theme.muted}
      />
    </View>
  );
}

function MealList({
  meals,
}: {
  meals: Awaited<ReturnType<typeof getMeals>>['meals'];
}) {
  const theme = useTheme();
  if (meals.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.h2, { color: theme.ink }]}>
          Nenhuma refeição ainda
        </Text>
        <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
          Adicione o que você comeu. Cada refeição vale XP.
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.h2, { color: theme.ink }]}>Refeições de hoje</Text>
      {meals.map((meal) => (
        <View key={meal.id} style={styles.meal}>
          <Text style={[styles.mealName, { color: theme.ink }]}>
            {meal.name}
          </Text>
          <Text style={{ color: theme.muted, fontFamily: fonts.native }}>
            {Math.round(meal.kcal)} kcal · {formatNumber(meal.protein)} g de
            proteína
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, paddingTop: 64, gap: 16 },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  h2: { fontFamily: fonts.native, fontSize: 20, fontWeight: '700' },
  card: { borderRadius: 14, padding: 16, gap: 14 },
  meal: { gap: 2 },
  mealName: { fontFamily: fonts.native, fontSize: 17, fontWeight: '600' },
});
