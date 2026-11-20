import { type Ref } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import { fonts, useTheme } from './theme';

export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          {subtitle}
        </Text>
      ) : null}
      <View style={styles.form}>{children}</View>
    </ScrollView>
  );
}

export function ErrorText({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.error, { color: theme.danger }]}
    >
      {children}
    </Text>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  inputRef?: Ref<TextInputInstance>;
};

export function Field({ label, error, inputRef, style, ...input }: FieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.ink }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.ink,
            borderColor: error ? theme.danger : theme.sep,
          },
          style,
        ]}
        {...input}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  busy,
  disabled,
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(busy || disabled), busy: !!busy }}
      disabled={busy || disabled}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: theme.blue, opacity: busy || disabled ? 0.5 : 1 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={theme.onBlue} />
      ) : (
        <Text style={[styles.buttonText, { color: theme.onBlue }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function TextLink({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={title}
      onPress={onPress}
      hitSlop={8}
      style={styles.link}
    >
      <Text style={[styles.linkText, { color: theme.blue }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontFamily: fonts.native, fontSize: 34, fontWeight: '700' },
  subtitle: { fontFamily: fonts.native, fontSize: 16, marginBottom: 8 },
  form: { gap: 16, marginTop: 16 },
  field: { gap: 6 },
  label: { fontFamily: fonts.native, fontSize: 15, fontWeight: '600' },
  input: {
    fontFamily: fonts.native,
    fontSize: 17,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  error: { fontFamily: fonts.native, fontSize: 14 },
  button: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.native, fontSize: 17, fontWeight: '600' },
  link: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  linkText: { fontFamily: fonts.native, fontSize: 16 },
});

/** Carregando e erro com "Tentar de novo", iguais em todas as telas que buscam dados. */
export function LoadStatus({
  state,
  retry,
  loadingText,
  errorText,
}: {
  state: { status: 'loading' | 'error' | 'ready' };
  retry: () => void;
  loadingText: string;
  errorText: string;
}) {
  const theme = useTheme();
  if (state.status === 'loading') {
    return (
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: theme.muted, fontFamily: fonts.native }}
      >
        {loadingText}
      </Text>
    );
  }
  if (state.status === 'error') {
    return (
      <View style={{ gap: 12 }}>
        <ErrorText>{errorText}</ErrorText>
        <PrimaryButton title="Tentar de novo" onPress={retry} />
      </View>
    );
  }
  return null;
}
