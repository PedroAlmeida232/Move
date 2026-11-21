import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { deleteAccount } from '../src/features/account/api';
import { useAuth } from '../src/lib/auth';
import { fonts, useTheme } from '../src/lib/theme';
import { ErrorText, PrimaryButton } from '../src/lib/ui';

type Exclusao = 'fechada' | 'confirmando' | 'excluindo' | 'erro';

export default function Ajustes() {
  const theme = useTheme();
  const { signOut } = useAuth();
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
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair"
          onPress={signOut}
          style={styles.row}
        >
          <Text style={[styles.rowText, { color: theme.blue }]}>Sair</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {exclusao === 'fechada' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Excluir conta"
            onPress={() => setExclusao('confirmando')}
            style={styles.row}
          >
            <Text style={[styles.rowText, { color: theme.danger }]}>
              Excluir conta
            </Text>
          </Pressable>
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
            <PrimaryButton
              title="Excluir definitivamente"
              onPress={excluir}
              busy={excluindo}
              danger
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              accessibilityState={{ disabled: excluindo }}
              disabled={excluindo}
              onPress={() => setExclusao('fechada')}
              style={styles.row}
            >
              <Text style={[styles.rowText, { color: theme.blue }]}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, gap: 16 },
  card: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4 },
  row: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  rowText: { fontFamily: fonts.native, fontSize: 17 },
  confirm: { gap: 12, paddingVertical: 12 },
  text: { fontFamily: fonts.native, fontSize: 16, lineHeight: 22 },
});
