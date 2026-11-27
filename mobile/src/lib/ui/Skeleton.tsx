import { View } from 'react-native';

import { radius, useTheme } from '../theme';

/** Bloco cinza no lugar do conteúdo que está carregando. */
export function Skeleton({ height }: { height: number }) {
  const theme = useTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
      accessibilityState={{ busy: true }}
      style={{
        height,
        borderRadius: radius.md,
        backgroundColor: theme.fill,
      }}
    />
  );
}
