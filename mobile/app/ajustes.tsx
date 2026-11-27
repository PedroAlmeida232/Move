import { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { deleteAccount } from '../src/features/account/api';
import { exportMyData } from '../src/features/account/exportData';
import {
  disableAllReminders,
  disableReminders,
  enableReminders,
  enabledKinds,
} from '../src/features/reminders/reminders';
import {
  REMINDER_HOURS,
  TRAINING_HOUR,
  type ReminderKind,
} from '../src/domain/reminders';
import { useAuth } from '../src/lib/auth';
import { POLICY_URL } from '../src/lib/links';
import {
  fonts,
  radius,
  space,
  touchTarget,
  type,
  useTheme,
} from '../src/lib/theme';
import { todayKey } from '../src/lib/time';
import { ErrorText } from '../src/lib/ui';
import { Button } from '../src/lib/ui/Button';
import { Card } from '../src/lib/ui/Card';
import { ListRow } from '../src/lib/ui/ListRow';
import { SwitchRow } from '../src/lib/ui/SwitchRow';

type Exclusao = 'fechada' | 'confirmando' | 'excluindo' | 'erro';
type Exportacao = 'parada' | 'preparando' | 'pronta' | 'erro';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  const [exportacao, setExportacao] = useState<Exportacao>('parada');
  const [lembretes, setLembretes] = useState<Record<ReminderKind, boolean>>({
    treino: false,
    peso: false,
  });
  const [hora, setHora] = useState(TRAINING_HOUR);
  const [mudando, setMudando] = useState<ReminderKind | null>(null);
  const [semPermissao, setSemPermissao] = useState(false);

  useEffect(() => {
    let ativo = true;
    enabledKinds().then((agora) => {
      if (!ativo) return;
      setLembretes({ treino: agora.treino, peso: agora.peso });
      setHora(agora.trainingHour);
    });
    return () => {
      ativo = false;
    };
  }, []);

  async function alternar(kind: ReminderKind, ligar: boolean, novaHora = hora) {
    setMudando(kind);
    setSemPermissao(false);
    try {
      if (ligar) {
        const ok = await enableReminders(kind, novaHora);
        if (ok) setHora(novaHora);
        if (!ok) setSemPermissao(true);
        setLembretes((l) => ({ ...l, [kind]: ok }));
      } else {
        await disableReminders(kind);
        setLembretes((l) => ({ ...l, [kind]: false }));
      }
    } finally {
      setMudando(null);
    }
  }

  async function exportar() {
    if (exportacao === 'preparando') return;
    setExportacao('preparando');
    try {
      await exportMyData(user?.email ?? null, todayKey());
      setExportacao('pronta');
    } catch {
      setExportacao('erro');
    }
  }

  // Lembretes são do aparelho: não devem continuar para quem sair da conta.
  async function sair() {
    await disableAllReminders();
    await signOut();
  }

  async function excluir() {
    setExclusao('excluindo');
    try {
      await deleteAccount();
    } catch {
      setExclusao('erro');
      return;
    }
    // A conta já não existe: encerrar a sessão leva de volta ao login.
    await sair();
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
    >
      <Section title="Conta">
        {user?.email ? (
          <ListRow
            icon="person-circle-outline"
            title="E-mail"
            value={user.email}
          />
        ) : null}
        <Button title="Sair" variant="text" onPress={sair} />
      </Section>

      <Section title="Lembretes">
        <SwitchRow
          icon="barbell-outline"
          title="Lembrar do treino"
          subtitle={`Nos dias do plano, às ${hora}h`}
          value={lembretes.treino}
          disabled={mudando !== null}
          onChange={(v) => alternar('treino', v)}
        />
        {lembretes.treino ? (
          <View style={styles.hours}>
            {REMINDER_HOURS.map((h) => (
              <Pressable
                key={h}
                accessibilityRole="button"
                accessibilityLabel={`Treino às ${h}h`}
                accessibilityState={{
                  selected: h === hora,
                  disabled: mudando !== null,
                }}
                disabled={mudando !== null}
                onPress={() => h !== hora && alternar('treino', true, h)}
                style={[
                  styles.hour,
                  { backgroundColor: h === hora ? theme.tint : theme.fill },
                ]}
              >
                <Text
                  style={[
                    styles.hourText,
                    { color: h === hora ? theme.blue : theme.ink },
                  ]}
                >
                  {h}h
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <SwitchRow
          icon="scale-outline"
          title="Lembrar de se pesar"
          subtitle="Aos domingos, às 9h"
          value={lembretes.peso}
          disabled={mudando !== null}
          onChange={(v) => alternar('peso', v)}
        />
        {semPermissao ? (
          <ErrorText>
            Ative as notificações do Move nos Ajustes do iPhone para receber
            lembretes.
          </ErrorText>
        ) : null}
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
        <ListRow
          icon="download-outline"
          title="Exportar meus dados"
          subtitle={exportacao === 'preparando' ? 'Preparando…' : undefined}
          onPress={exportar}
        />
        {exportacao === 'pronta' ? (
          <Text
            accessibilityRole="alert"
            style={[styles.caption, { color: theme.sucesso }]}
          >
            Dados exportados
          </Text>
        ) : null}
        {exportacao === 'erro' ? (
          <ErrorText>
            Não foi possível exportar seus dados. Tente de novo.
          </ErrorText>
        ) : null}
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
  hours: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  hour: {
    minWidth: touchTarget,
    minHeight: touchTarget,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourText: { fontFamily: fonts.native, ...type.callout },
  caption: { fontFamily: fonts.native, ...type.caption },
  text: { fontFamily: fonts.native, ...type.body },
});
