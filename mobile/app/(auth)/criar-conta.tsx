import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  type TextInputInstance,
  View,
} from 'react-native';

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
import { fonts, useTheme } from '../../src/lib/theme';

const CONSENT_REQUIRED =
  'Para criar a conta, aceite o uso dos seus dados de saúde.';

export default function CriarConta() {
  const { signUp } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    consent?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);

  async function submit() {
    const found = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      consent: consent ? undefined : CONSENT_REQUIRED,
    };
    setErrors(found);
    if (found.email) return emailRef.current?.focus();
    if (found.password) return passwordRef.current?.focus();
    if (found.consent) return;

    setBusy(true);
    try {
      await signUp(email.trim(), password);
    } catch (error) {
      setErrors({ form: authErrorMessage(error) });
      setBusy(false);
    }
  }

  return (
    <AuthScreen
      title="Criar conta"
      subtitle="Treino, dieta e progresso em um só lugar."
    >
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
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <View style={styles.consent}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="Aceito o uso dos meus dados de saúde"
          accessibilityState={{ checked: consent }}
          onPress={() => setConsent((value) => !value)}
          hitSlop={8}
          style={[
            styles.box,
            {
              borderColor: errors.consent ? theme.danger : theme.blue,
              backgroundColor: consent ? theme.blue : 'transparent',
            },
          ]}
        >
          {consent ? (
            <Text style={{ color: theme.onBlue, fontWeight: '700' }}>✓</Text>
          ) : null}
        </Pressable>
        <Text style={[styles.consentText, { color: theme.ink }]}>
          Autorizo o Move a tratar meus dados de saúde (peso, treino e dieta)
          para oferecer o app. Posso excluir minha conta e meus dados quando
          quiser.
        </Text>
      </View>
      <TextLink
        title="Política de privacidade"
        onPress={() => Linking.openURL(POLICY_URL)}
      />
      {errors.consent ? <ErrorText>{errors.consent}</ErrorText> : null}

      {errors.form ? <ErrorText>{errors.form}</ErrorText> : null}
      <PrimaryButton title="Criar conta" onPress={submit} busy={busy} />
      <SocialButtons
        beforeStart={() => {
          if (consent) return true;
          setErrors({ consent: CONSENT_REQUIRED });
          return false;
        }}
      />
      <TextLink
        title="Já tenho conta"
        onPress={() => router.replace('/entrar')}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  consent: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  box: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentText: {
    flex: 1,
    fontFamily: fonts.native,
    fontSize: 15,
    lineHeight: 21,
  },
});
