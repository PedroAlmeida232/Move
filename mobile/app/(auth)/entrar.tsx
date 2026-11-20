import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { type TextInputInstance } from 'react-native';

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
import { useAuth } from '../../src/lib/auth';

export default function Entrar() {
  const { signIn } = useAuth();
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
    </AuthScreen>
  );
}
