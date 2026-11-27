import { render, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { radius, shadow, themes } from '../src/lib/theme';
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

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const mockScheme = useColorScheme as jest.Mock;

beforeEach(() => mockScheme.mockReturnValue('light'));

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, bottom: 34, left: 0, right: 0 },
};

const styleOf = (id: string) =>
  StyleSheet.flatten(screen.getByTestId(id).props.style);

describe('Screen', () => {
  it('mostra o título como cabeçalho e o conteúdo', async () => {
    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <Screen title="Hoje">
          <Text>Conteúdo</Text>
        </Screen>
      </SafeAreaProvider>,
    );
    expect(screen.getByRole('header', { name: 'Hoje' })).toBeOnTheScreen();
    expect(screen.getByText('Conteúdo')).toBeOnTheScreen();
  });

  it('respeita a área segura e puxa para atualizar', async () => {
    const onRefresh = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <Screen title="Hoje" onRefresh={onRefresh} testID="tela">
          <Text>Conteúdo</Text>
        </Screen>
      </SafeAreaProvider>,
    );
    const scroll = screen.getByTestId('tela');
    const content = StyleSheet.flatten(scroll.props.contentContainerStyle);
    expect(content.paddingTop).toBeGreaterThanOrEqual(47);
    expect(content.paddingBottom).toBeGreaterThanOrEqual(34);
    expect(scroll.props.refreshControl.props.refreshing).toBe(false);
    scroll.props.refreshControl.props.onRefresh();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('sem onRefresh não tem puxar para atualizar', async () => {
    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <Screen title="Hoje" testID="tela">
          <Text>Conteúdo</Text>
        </Screen>
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('tela').props.refreshControl).toBeUndefined();
  });
});

describe('Card', () => {
  it.each(['light', 'dark'] as const)(
    'usa cor, raio e sombra do tema %s',
    async (mode) => {
      mockScheme.mockReturnValue(mode);
      await render(
        <Card testID="card">
          <Text>Oi</Text>
        </Card>,
      );
      expect(screen.getByText('Oi')).toBeOnTheScreen();
      const style = styleOf('card');
      expect(style).toMatchObject({
        backgroundColor: themes[mode].card,
        borderRadius: radius.lg,
      });
      if (mode === 'light') expect(style).toMatchObject(shadow.card!);
      else
        Object.keys(shadow.card!).forEach((k) =>
          expect(style).not.toHaveProperty(k),
        );
    },
  );
});

describe('ListRow', () => {
  it('com onPress é um botão que lê título, subtítulo e valor', async () => {
    const onPress = jest.fn();
    await render(
      <ListRow
        icon="barbell"
        title="Treino"
        subtitle="Costas"
        value="3 de 5"
        onPress={onPress}
      />,
    );
    const row = screen.getByRole('button', { name: 'Treino, Costas, 3 de 5' });
    expect(row).toHaveStyle({ minHeight: 44 });
    await userEvent.setup().press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(
      screen.getByTestId('seta', { includeHiddenElements: true }),
    ).toBeOnTheScreen();
  });

  it('sem onPress não é botão nem tem seta', async () => {
    await render(<ListRow title="Altura" value="1,80 m" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByLabelText('Altura, 1,80 m')).toBeOnTheScreen();
    expect(
      screen.queryByTestId('seta', { includeHiddenElements: true }),
    ).toBeNull();
  });
});

describe('Button', () => {
  it.each(['primary', 'secondary', 'text'] as const)(
    '%s é um botão com rótulo e dispara onPress',
    async (variant) => {
      const onPress = jest.fn();
      await render(
        <Button title="Salvar" variant={variant} onPress={onPress} />,
      );
      const button = screen.getByRole('button', { name: 'Salvar' });
      expect(button).toHaveStyle({ minHeight: 44 });
      await userEvent.setup().press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['light', 'dark'] as const)(
    'principal usa a cor de ação no tema %s',
    async (mode) => {
      mockScheme.mockReturnValue(mode);
      await render(<Button title="Salvar" onPress={jest.fn()} />);
      expect(screen.getByRole('button')).toHaveStyle({
        backgroundColor: themes[mode].action,
      });
    },
  );

  it('desativado não dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Button title="Salvar" disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toBeDisabled();
    await userEvent.setup().press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('carregando não dispara onPress e avisa que está ocupado', async () => {
    const onPress = jest.fn();
    await render(<Button title="Salvar" loading onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    await userEvent.setup().press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

const LIMITES = [
  [42.4, 42],
  [-10, 0],
  [0, 0],
  [100, 100],
  [150, 100],
  [NaN, 0],
  [Infinity, 100],
] as const;

describe.each([
  ['ProgressRing', ProgressRing],
  ['ProgressBar', ProgressBar],
] as const)('%s', (_, Progress) => {
  it.each(LIMITES)('com %p informa %p%% ao VoiceOver', async (value, now) => {
    await render(<Progress label="Meta" value={value} />);
    const el = screen.getByRole('progressbar', { name: 'Meta' });
    expect(el).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now,
      text: `${now}%`,
    });
  });
});

describe('ProgressRing', () => {
  it('mostra o conteúdo do centro', async () => {
    await render(
      <ProgressRing label="Meta" value={50}>
        <Text>50%</Text>
      </ProgressRing>,
    );
    expect(
      screen.getByText('50%', { includeHiddenElements: true }),
    ).toBeOnTheScreen();
  });
});

describe('StatTile', () => {
  it('lê rótulo e valor juntos', async () => {
    await render(<StatTile label="Sequência" value="7 dias" />);
    expect(screen.getByLabelText('Sequência: 7 dias')).toBeOnTheScreen();
    expect(screen.getByText('7 dias')).toBeOnTheScreen();
  });
});

describe('EmptyState', () => {
  it('mostra título como cabeçalho, mensagem e ação', async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState
        icon="restaurant"
        title="Nada por aqui"
        message="Registre uma refeição."
        actionTitle="Registrar"
        onAction={onAction}
      />,
    );
    expect(
      screen.getByRole('header', { name: 'Nada por aqui' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Registre uma refeição.')).toBeOnTheScreen();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Registrar' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('sem ação não mostra botão', async () => {
    await render(
      <EmptyState icon="restaurant" title="Vazio" message="Nada." />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('ErrorState', () => {
  it('avisa o erro e chama o tentar de novo', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState message="Sem conexão." onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Sem conexão.');
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('Skeleton', () => {
  it('avisa que está carregando', async () => {
    await render(<Skeleton height={32} />);
    const el = screen.getByRole('progressbar', { name: 'Carregando' });
    expect(el).toBeBusy();
    expect(el).toHaveStyle({ height: 32 });
  });
});
