import { Text, View } from 'react-native';

import { fonts, useTheme } from '../../lib/theme';
import { ErrorText, PrimaryButton } from '../../lib/ui';

import type { usePlan } from './usePlan';

// Carregando e erro, iguais nas telas Hoje e Plano.
export function PlanStatus({ state, retry }: ReturnType<typeof usePlan>) {
  const theme = useTheme();
  if (state.status === 'loading') {
    return (
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: theme.muted, fontFamily: fonts.native }}
      >
        Carregando treino…
      </Text>
    );
  }
  if (state.status === 'error') {
    return (
      <View style={{ gap: 12 }}>
        <ErrorText>
          Não foi possível carregar o treino. Verifique sua conexão.
        </ErrorText>
        <PrimaryButton title="Tentar de novo" onPress={retry} />
      </View>
    );
  }
  return null;
}
