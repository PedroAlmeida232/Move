import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, space, touchTarget, type, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

export function ListRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  /** Com ela a linha vira botão e ganha a seta. */
  onPress?: () => void;
}) {
  const theme = useTheme();
  const label = [title, subtitle, value].filter(Boolean).join(', ');
  const content = (
    <>
      {icon ? <Icon name={icon} color={theme.blue} /> : null}
      <View style={styles.texts}>
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.support, { color: theme.muted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.support, styles.value, { color: theme.muted }]}>
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <Icon
          testID="seta"
          name="chevron-forward"
          color={theme.muted}
          size={type.body.fontSize}
        />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View accessible accessibilityLabel={label} style={styles.row}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.row}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  texts: { flex: 1 },
  title: { fontFamily: fonts.native, ...type.body },
  support: { fontFamily: fonts.native, ...type.callout },
  value: { flexShrink: 1, textAlign: 'right' },
});
