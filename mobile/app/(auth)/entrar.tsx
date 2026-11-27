import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Text, type TextInputInstance } from 'react-native';

import { authErrorMessage } from '../../src/domain/auth-errors';
import {
  validateEmail,
  validatePassword,
} from '../../src/domain/auth-validation';
import {
  AuthScreen,
  ErrorText,
  Field,
  PrimaryButton,
  TextLink,
} from '../../src/lib/ui';
import { SocialButtons } from '../../src/features/auth/SocialButtons';
import { useAuth } from '../../src/lib/auth';
import { POLICY_URL } from '../../src/lib/links';
import { fonts, type, useTheme } from '../../src/lib/theme';

export default function Entrar() {
  const { signIn } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);

  async function submit() {
    const found = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setErrors(found);
    if (found.email) return emailRef.current?.focus();
    if (found.password) return passwordRef.current?.focus();

    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setErrors({ form: authErrorMessage(error) });
      setBusy(false);
    }
  }

  return (
    <AuthScreen title="Entrar" subtitle="Bem-vindo de volta ao Move.">
      <Field
        label="E-mail"
        inputRef={emailRef}
        error={errors.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <Field
        label="Senha"
        inputRef={passwordRef}
        error={errors.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      {errors.form ? <ErrorText>{errors.form}</ErrorText> : null}
      <PrimaryButton title="Entrar" onPress={submit} busy={busy} />
      <TextLink
        title="Esqueci minha senha"
        onPress={() => router.push('/recuperar-senha')}
      />
      <TextLink
        title="Criar conta"
        onPress={() => router.push('/criar-conta')}
      />
      <SocialButtons />
      <Text
        style={{ color: theme.muted, fontFamily: fonts.native, ...type.caption }}
      >
        Ao continuar com Apple ou Google, você autoriza o Move a tratar seus
        dados de saúde (peso, treino e dieta) para oferecer o app.
      </Text>
      <TextLink
        title="Política de privacidade"
        onPress={() => Linking.openURL(POLICY_URL)}
      />
    </AuthScreen>
  );
}
