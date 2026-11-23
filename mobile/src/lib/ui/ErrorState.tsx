import { StyleSheet, Text, View } from 'react-native';

import { fonts, space, type, useTheme } from '../theme';
import { Button } from './Button';
import { Icon } from './Icon';

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.box}>
      <Icon
        name="alert-circle"
        color={theme.erro}
        size={type.largeTitle.fontSize}
      />
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.message, { color: theme.ink }]}
      >
        {message}
      </Text>
      <Button title="Tentar de novo" variant="secondary" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: space.md, padding: space.xl },
  message: { fontFamily: fonts.native, ...type.callout, textAlign: 'center' },
});
