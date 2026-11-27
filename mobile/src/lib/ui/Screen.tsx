import { type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, space, type, useTheme } from '../theme';

export function Screen({
  title,
  children,
  onRefresh,
  refreshing = false,
  testID,
  headerRight,
}: {
  title: string;
  /** Ação à direita do título grande (por exemplo, o botão de Ajustes). */
  headerRight?: ReactNode;
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
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={1.4}
          style={[styles.title, { color: theme.ink }]}
        >
          {title}
        </Text>
        {headerRight}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: space.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  title: { flexShrink: 1, fontFamily: fonts.native, ...type.largeTitle },
});
