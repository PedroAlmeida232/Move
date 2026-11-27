import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, type TextInputInstance } from 'react-native';

import { authErrorMessage } from '../../src/domain/auth-errors';
import { validateEmail } from '../../src/domain/auth-validation';
import {
  AuthScreen,
  ErrorText,
  Field,
  PrimaryButton,
  TextLink,
} from '../../src/lib/ui';
import { useAuth } from '../../src/lib/auth';
import { fonts, type, useTheme } from '../../src/lib/theme';

const SENT =
  'Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.';

export default function RecuperarSenha() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const emailRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<{ email?: string; form?: string }>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setSent(false);
    const invalid = validateEmail(email);
    setError({ email: invalid ?? undefined });
    if (invalid) return emailRef.current?.focus();

    setBusy(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      // Não revelamos se o e-mail tem conta: o mesmo aviso de sucesso.
      if ((e as { code?: string })?.code === 'auth/user-not-found')
        setSent(true);
      else setError({ form: authErrorMessage(e) });
    }
    setBusy(false);
  }

  return (
    <AuthScreen
      title="Recuperar senha"
      subtitle="Enviaremos um link para você criar uma nova senha."
    >
      <Field
        label="E-mail"
        inputRef={emailRef}
        error={error.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
      />
      {error.form ? <ErrorText>{error.form}</ErrorText> : null}
      {sent ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{ color: theme.ink, fontFamily: fonts.native, ...type.callout }}
        >
          {SENT}
        </Text>
      ) : null}
      <PrimaryButton title="Enviar link" onPress={submit} busy={busy} />
      <TextLink
        title="Voltar para entrar"
        onPress={() => router.replace('/entrar')}
      />
    </AuthScreen>
  );
}
