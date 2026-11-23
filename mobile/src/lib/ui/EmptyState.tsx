import { StyleSheet, Text, View } from 'react-native';

import { fonts, iconSize, space, type, useTheme } from '../theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export function EmptyState({
  icon,
  title,
  message,
  actionTitle,
  onAction,
}: {
  icon: IconName;
  title: string;
  message: string;
} & (
  | { actionTitle: string; onAction: () => void }
  | { actionTitle?: undefined; onAction?: undefined }
)) {
  const theme = useTheme();
  return (
    <View style={styles.box}>
      <Icon name={icon} color={theme.muted} size={iconSize.lg} />
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        {title}
      </Text>
      <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>
      {actionTitle ? <Button title={actionTitle} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: space.md, padding: space.xl },
  title: { fontFamily: fonts.native, ...type.headline, textAlign: 'center' },
  message: { fontFamily: fonts.native, ...type.callout, textAlign: 'center' },
});
