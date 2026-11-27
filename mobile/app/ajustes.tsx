import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { deleteAccount } from '../src/features/account/api';
import { useAuth } from '../src/lib/auth';
import { POLICY_URL } from '../src/lib/links';
import { fonts, space, type, useTheme } from '../src/lib/theme';
import { ErrorText } from '../src/lib/ui';
import { Button } from '../src/lib/ui/Button';
import { Card } from '../src/lib/ui/Card';
import { ListRow } from '../src/lib/ui/ListRow';

type Exclusao = 'fechada' | 'confirmando' | 'excluindo' | 'erro';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { color: theme.muted }]}
      >
        {title}
      </Text>
      <Card>{children}</Card>
    </View>
  );
}

export default function Ajustes() {
  const theme = useTheme();
  const { signOut, user } = useAuth();
  const [exclusao, setExclusao] = useState<Exclusao>('fechada');
  const excluindo = exclusao === 'excluindo';

  async function excluir() {
    setExclusao('excluindo');
    try {
      await deleteAccount();
    } catch {
      setExclusao('erro');
      return;
    }
    // A conta já não existe: encerrar a sessão leva de volta ao login.
    await signOut();
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
    >
      <Section title="Conta">
        {user?.email ? (
          <ListRow icon="person-circle-outline" title="E-mail" value={user.email} />
        ) : null}
        <Button title="Sair" variant="text" onPress={signOut} />
      </Section>

      <Section title="Aparência">
        <ListRow
          icon="contrast-outline"
          title="Aparência"
          subtitle="Automática"
          value="segue o iPhone"
        />
      </Section>

      <Section title="Privacidade">
        <ListRow
          icon="shield-checkmark-outline"
          title="Política de privacidade"
          onPress={() => Linking.openURL(POLICY_URL)}
        />
      </Section>

      <Card>
        {exclusao === 'fechada' ? (
          <Button
            title="Excluir conta"
            variant="text"
            danger
            onPress={() => setExclusao('confirmando')}
          />
        ) : (
          <View style={styles.confirm}>
            <Text style={[styles.text, { color: theme.ink }]}>
              Excluir a conta apaga para sempre seus treinos, refeições, pesos e
              conquistas. Isso não pode ser desfeito.
            </Text>
            {exclusao === 'erro' ? (
              <ErrorText>
                Não foi possível excluir a conta. Tente de novo.
              </ErrorText>
            ) : null}
            <Button
              title="Excluir definitivamente"
              onPress={excluir}
              loading={excluindo}
              danger
            />
            <Button
              title="Cancelar"
              variant="text"
              disabled={excluindo}
              onPress={() => setExclusao('fechada')}
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space.lg, gap: space.xl },
  section: { gap: space.sm },
  sectionTitle: {
    fontFamily: fonts.native,
    ...type.caption,
    textTransform: 'uppercase',
    paddingHorizontal: space.lg,
  },
  confirm: { gap: space.md },
  text: { fontFamily: fonts.native, ...type.body },
});
