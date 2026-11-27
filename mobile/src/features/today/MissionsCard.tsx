import { StyleSheet, Text, View } from 'react-native';

import { type Mission } from '../../domain/today';
import { fonts, space, touchTarget, type, useTheme } from '../../lib/theme';
import { Card } from '../../lib/ui/Card';
import { Icon } from '../../lib/ui/Icon';

export function MissionsCard({ missions }: { missions: Mission[] }) {
  const theme = useTheme();
  return (
    <Card>
      {missions.map((m) => (
        <View
          key={m.id}
          accessible
          accessibilityRole="checkbox"
          accessibilityLabel={m.title}
          accessibilityState={{ checked: m.done }}
          style={styles.row}
        >
          <Icon
            name={m.done ? 'checkmark-circle' : 'ellipse-outline'}
            color={m.done ? theme.sucesso : theme.muted}
          />
          <Text
            style={[
              styles.title,
              { color: m.done ? theme.muted : theme.ink },
            ]}
          >
            {m.title}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  title: { flex: 1, fontFamily: fonts.native, ...type.body },
});
