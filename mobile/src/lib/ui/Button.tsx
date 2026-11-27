import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { fonts, radius, space, touchTarget, type, useTheme } from '../theme';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  loading?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const blocked = loading || disabled;
  const { color, backgroundColor } = {
    primary: { color: theme.onBlue, backgroundColor: theme.action },
    secondary: { color: theme.ink, backgroundColor: theme.fill },
    text: { color: theme.blue, backgroundColor: undefined },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={[styles.button, { backgroundColor, opacity: blocked ? 0.5 : 1 }]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.title, { color }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touchTarget,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.native, ...type.headline, textAlign: 'center' },
});
