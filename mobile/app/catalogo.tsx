import { Redirect } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, space, type, useTheme } from '../src/lib/theme';
import { Button } from '../src/lib/ui/Button';
import { Card } from '../src/lib/ui/Card';
import { EmptyState } from '../src/lib/ui/EmptyState';
import { ErrorState } from '../src/lib/ui/ErrorState';
import { ListRow } from '../src/lib/ui/ListRow';
import { ProgressBar } from '../src/lib/ui/ProgressBar';
import { ProgressRing } from '../src/lib/ui/ProgressRing';
import { Screen } from '../src/lib/ui/Screen';
import { Skeleton } from '../src/lib/ui/Skeleton';
import { StatTile } from '../src/lib/ui/StatTile';

const nada = () => {};

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.ink }]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Catálogo interno dos componentes, só em desenvolvimento (rota /catalogo). */
export default function Catalogo() {
  const theme = useTheme();
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <Screen title="Catálogo" onRefresh={nada}>
      <Section title="Card e ListRow">
        <Card>
          <ListRow
            icon="barbell"
            title="Treino"
            subtitle="Costas e postura"
            value="3 de 5"
            onPress={nada}
          />
          <ListRow icon="resize" title="Altura" value="1,80 m" />
        </Card>
      </Section>
      <Section title="Button">
        <Button title="Principal" onPress={nada} />
        <Button title="Secundário" variant="secondary" onPress={nada} />
        <Button title="Texto" variant="text" onPress={nada} />
        <Button title="Carregando" loading onPress={nada} />
        <Button title="Desativado" disabled onPress={nada} />
      </Section>
      <Section title="ProgressRing">
        <Card>
          <View style={styles.row}>
            <ProgressRing label="Meta de treino" value={72}>
              <Text style={[styles.title, { color: theme.ink }]}>72%</Text>
            </ProgressRing>
            <ProgressRing label="Meta vazia" value={0} />
          </View>
        </Card>
      </Section>
      <Section title="ProgressBar">
        <Card>
          <ProgressBar label="Proteína" value={40} />
          <ProgressBar label="Calorias" value={100} color={theme.sucesso} />
        </Card>
      </Section>
      <Section title="StatTile">
        <Card>
          <View style={styles.row}>
            <StatTile label="Sequência" value="7 dias" />
            <StatTile label="XP" value="1.240" />
          </View>
        </Card>
      </Section>
      <Section title="EmptyState">
        <Card>
          <EmptyState
            icon="restaurant"
            title="Nenhuma refeição hoje"
            message="Registre a primeira para acompanhar a meta."
            actionTitle="Registrar refeição"
            onAction={nada}
          />
        </Card>
      </Section>
      <Section title="ErrorState">
        <Card>
          <ErrorState
            message="Não foi possível carregar. Verifique sua conexão."
            onRetry={nada}
          />
        </Card>
      </Section>
      <Section title="Skeleton">
        <Card>
          <Skeleton height={space.xl} />
          <Skeleton height={space.xxl} />
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  row: { flexDirection: 'row', gap: space.lg },
  title: { fontFamily: fonts.native, ...type.title },
});
