import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  dayTotals,
  goalPct,
  recentMeals,
  validateMeal,
  type MealForm,
  type MealInput,
} from '../../src/domain/diet';
import { formatNumber } from '../../src/domain/format';
import {
  getMealHistory,
  getMeals,
  postMeal,
  type DayMeals,
  type Meal,
} from '../../src/features/meal/api';
import { GoalBar } from '../../src/features/meal/GoalBar';
import { fonts, space, type, useTheme } from '../../src/lib/theme';
import { todayKey } from '../../src/lib/time';
import { ErrorText, Field } from '../../src/lib/ui';
import { Button } from '../../src/lib/ui/Button';
import { Card } from '../../src/lib/ui/Card';
import { EmptyState } from '../../src/lib/ui/EmptyState';
import { ErrorState } from '../../src/lib/ui/ErrorState';
import { ListRow } from '../../src/lib/ui/ListRow';
import { ProgressRing } from '../../src/lib/ui/ProgressRing';
import { Screen } from '../../src/lib/ui/Screen';
import { Sheet } from '../../src/lib/ui/Sheet';
import { Skeleton } from '../../src/lib/ui/Skeleton';
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
  const [today] = useState(todayKey);
  const day = useResource(() => getMeals(today));
  // Histórico para "Recentes" na folha. Se falhar, a folha só não mostra a seção.
  const history = useResource(async () => (await getMealHistory()).meals);
  const [open, setOpen] = useState(false);
  const recents =
    history.state.status === 'ready' ? recentMeals(history.state.data) : [];

  let content;
  if (day.state.status === 'loading') {
    content = (
      <>
        <Skeleton height={180} />
        <Skeleton height={120} />
      </>
    );
  } else if (day.state.status === 'error') {
    content = (
      <ErrorState
        message="Não foi possível carregar as refeições. Verifique sua conexão."
        onRetry={day.retry}
      />
    );
  } else {
    const data = day.state.data;
    content = (
      <>
        <Summary data={data} />
        <Button title="Adicionar refeição" onPress={() => setOpen(true)} />
        <MealList meals={data.meals} />
        <AddMealSheet
          visible={open}
          date={today}
          recents={recents}
          onClose={() => setOpen(false)}
          onSaved={(meal) => {
            day.update((d) => ({ ...d, meals: [...d.meals, meal] }));
            history.update((list) => [...list, meal]);
            setOpen(false);
          }}
        />
      </>
    );
  }

  return <Screen title="Dieta">{content}</Screen>;
}

function Summary({ data }: { data: DayMeals }) {
  const theme = useTheme();
  const totals = dayTotals(data.meals);
  const kcal = Math.round(totals.kcal);
  const left = data.goals.kcal - kcal;
  const status =
    left >= 0 ? `Faltam ${left} kcal` : `${-left} kcal acima da meta`;
  return (
    <Card>
      <View style={styles.summary}>
        <ProgressRing
          label="Calorias"
          value={goalPct(totals.kcal, data.goals.kcal)}
          color={theme.r3}
        >
          <Text style={[styles.ringValue, { color: theme.ink }]}>{kcal}</Text>
          <Text style={[styles.ringCaption, { color: theme.muted }]}>
            de {data.goals.kcal} kcal
          </Text>
        </ProgressRing>
        <View style={styles.macros}>
          <Text
            style={[
              styles.status,
              { color: left >= 0 ? theme.ink : theme.alerta },
            ]}
          >
            {status}
          </Text>
          <GoalBar
            label="Proteína"
            value={totals.protein}
            goal={data.goals.protein}
            unit="g"
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
            color={theme.r3}
          />
        </View>
      </View>
    </Card>
  );
}

function MealList({ meals }: { meals: DayMeals['meals'] }) {
  const theme = useTheme();
  if (meals.length === 0) {
    return (
      <EmptyState
        icon="restaurant-outline"
        title="Nenhuma refeição ainda"
        message="Adicione o que você comeu. Cada refeição vale XP."
      />
    );
  }
  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { color: theme.ink }]}
      >
        Refeições de hoje
      </Text>
      <Card>
        {meals.map((meal) => (
          <ListRow
            key={meal.id}
            title={meal.name}
            subtitle={`${formatNumber(meal.protein)} g de proteína`}
            value={`${Math.round(meal.kcal)} kcal`}
          />
        ))}
      </Card>
    </View>
  );
}

function AddMealSheet({
  visible,
  date,
  recents,
  onClose,
  onSaved,
}: {
  visible: boolean;
  date: string;
  recents: MealInput[];
  onClose: () => void;
  onSaved: (meal: Meal) => void;
}) {
  const theme = useTheme();
  const [form, setForm] = useState<MealForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof MealForm, string>>>(
    {},
  );
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);

  function close() {
    setForm(EMPTY);
    setErrors({});
    setSaveError(false);
    onClose();
  }

  async function post(meal: MealInput) {
    setSaveError(false);
    setBusy(true);
    try {
      const saved = await postMeal({ ...meal, date });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setForm(EMPTY);
      setErrors({});
      onSaved(saved);
    } catch {
      setSaveError(true);
    }
    setBusy(false);
  }

  function save() {
    const { errors: found, meal } = validateMeal(form);
    setErrors(found);
    setSaveError(false);
    if (meal) return post(meal);
  }

  return (
    <Sheet visible={visible} title="Nova refeição" onClose={close}>
      {recents.length > 0 ? (
        <View accessibilityLabel="Refeições recentes" style={styles.section}>
          <Text
            accessibilityRole="header"
            style={[styles.caption, { color: theme.muted }]}
          >
            Recentes
          </Text>
          <Card>
            {recents.map((meal) => (
              <ListRow
                key={meal.name}
                icon="refresh-outline"
                title={meal.name}
                value={`${Math.round(meal.kcal)} kcal`}
                onPress={() => {
                  if (!busy) post(meal);
                }}
              />
            ))}
          </Card>
          <Text style={[styles.caption, { color: theme.muted }]}>
            Ou digite uma nova
          </Text>
        </View>
      ) : null}
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
        <ErrorText>Não foi possível salvar a refeição. Tente de novo.</ErrorText>
      ) : null}
      <Button title="Salvar refeição" onPress={save} loading={busy} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  macros: { flex: 1, gap: space.md },
  ringValue: { fontFamily: fonts.native, ...type.title, textAlign: 'center' },
  ringCaption: {
    fontFamily: fonts.native,
    ...type.caption,
    textAlign: 'center',
  },
  status: { fontFamily: fonts.native, ...type.headline },
  section: { gap: space.sm },
  sectionTitle: { fontFamily: fonts.native, ...type.title },
  caption: { fontFamily: fonts.native, ...type.caption },
});
