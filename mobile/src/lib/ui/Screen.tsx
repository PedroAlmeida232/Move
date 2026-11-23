import { type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, space, type, useTheme } from '../theme';

export function Screen({
  title,
  children,
  onRefresh,
  refreshing = false,
  testID,
}: {
  title: string;
  children: ReactNode;
  /** Puxar para atualizar; sem ela o gesto fica desligado. */
  onRefresh?: () => void;
  refreshing?: boolean;
  testID?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      testID={testID}
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + space.lg,
          paddingBottom: insets.bottom + space.xxl,
          paddingLeft: insets.left + space.lg,
          paddingRight: insets.right + space.lg,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.muted}
          />
        ) : undefined
      }
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        {title}
      </Text>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: space.lg },
  title: { fontFamily: fonts.native, ...type.largeTitle },
});
