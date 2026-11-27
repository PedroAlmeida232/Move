import { StyleSheet, Text, View } from 'react-native';

import { fonts, space, type, useTheme } from '../../lib/theme';
import { Button } from '../../lib/ui/Button';
import { Card } from '../../lib/ui/Card';
import { Icon } from '../../lib/ui/Icon';
import { type PlanDay } from '../workout/api';

/** Resumo do treino de hoje; os exercícios aparecem depois de "Começar treino". */
export function WorkoutCard({
  day,
  doneToday,
  onStart,
}: {
  day: PlanDay;
  doneToday: boolean;
  /** Sem ela o botão some (o treino já começou). */
  onStart?: () => void;
}) {
  const theme = useTheme();
  const count = day.exercises.length;
  return (
    <Card>
      <View style={styles.texts}>
        <Text style={[styles.caption, { color: theme.muted }]}>
          Treino de hoje
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.name, { color: theme.ink }]}
        >
          {day.name}
        </Text>
        <Text style={[styles.callout, { color: theme.muted }]}>
          {count} {count === 1 ? 'exercício' : 'exercícios'}
        </Text>
      </View>
      {doneToday ? (
        <View style={styles.done}>
          <Icon name="checkmark-circle" color={theme.sucesso} />
          <Text style={[styles.callout, { color: theme.sucesso }]}>
            Treino de hoje concluído
          </Text>
        </View>
      ) : null}
      {onStart ? <Button title="Começar treino" onPress={onStart} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  texts: { gap: space.xs },
  caption: { fontFamily: fonts.native, ...type.caption },
  name: { fontFamily: fonts.native, ...type.title },
  callout: { fontFamily: fonts.native, ...type.callout },
  done: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
