import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { authErrorMessage } from '../../domain/auth-errors';
import { useAuth, type SocialResult } from '../../lib/auth';
import {
  fonts,
  radius,
  space,
  touchTarget,
  type,
  useTheme,
} from '../../lib/theme';
import { ErrorText } from '../../lib/ui';
import { Icon, type IconName } from '../../lib/ui/Icon';

type Provider = 'apple' | 'google';

/**
 * "Continuar com Apple" (só no iOS, como a Apple exige junto do Google) e
 * "Continuar com Google". `beforeStart` pode impedir o início (ex.: falta o consentimento).
 */
export function SocialButtons({
  beforeStart,
}: {
  beforeStart?: () => boolean;
}) {
  const theme = useTheme();
  const { signInWithApple, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(
    provider: Provider,
    signInWith: () => Promise<SocialResult>,
  ) {
    setError(null);
    if (beforeStart && !beforeStart()) return;
    setBusy(provider);
    try {
      await signInWith();
    } catch (e) {
      setError(authErrorMessage(e));
    }
    setBusy(null);
  }

  return (
    <View style={styles.stack}>
      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: theme.sep }]} />
        <Text style={{ color: theme.muted, fontFamily: fonts.native }}>ou</Text>
        <View style={[styles.line, { backgroundColor: theme.sep }]} />
      </View>
      {Platform.OS === 'ios' ? (
        <SocialButton
          title="Continuar com Apple"
          icon="logo-apple"
          busy={busy === 'apple'}
          disabled={busy !== null}
          onPress={() => start('apple', signInWithApple)}
          background={theme.ink}
          color={theme.bg}
        />
      ) : null}
      <SocialButton
        title="Continuar com Google"
        icon="logo-google"
        busy={busy === 'google'}
        disabled={busy !== null}
        onPress={() => start('google', signInWithGoogle)}
        background={theme.card}
        color={theme.ink}
        border={theme.sep}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

function SocialButton({
  title,
  icon,
  onPress,
  busy,
  disabled,
  background,
  color,
  border,
}: {
  title: string;
  icon: IconName;
  onPress: () => void;
  busy: boolean;
  disabled: boolean;
  background: string;
  color: string;
  border?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: background,
          borderColor: border ?? background,
          opacity: disabled && !busy ? 0.6 : 1,
        },
      ]}
    >
      <Icon name={icon} color={color} />
      <Text style={[styles.text, { color }]}>{busy ? 'Aguarde…' : title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: space.md },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  // Apple e Google pedem a mesma altura e cantos do botão principal, com o logo à esquerda do texto.
  button: {
    minHeight: touchTarget + space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: fonts.native, ...type.headline },
});
