import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';
import * as RN from 'react-native';

import { Card } from '../src/lib/ui/Card';
import { ProgressRing } from '../src/lib/ui/ProgressRing';
import { Skeleton } from '../src/lib/ui/Skeleton';
import { StatTile } from '../src/lib/ui/StatTile';

function reduzirMovimento(ligado: boolean) {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(ligado);
}

function tamanhoDaFonte(fontScale: number) {
  jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({
    width: 390,
    height: 844,
    scale: 3,
    fontScale,
  });
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('animações leves', () => {
  it('o card entra suave: começa transparente e aparece em seguida', async () => {
    jest.useFakeTimers();
    reduzirMovimento(false);
    await render(
      <Card testID="card">
        <Text>oi</Text>
      </Card>,
    );

    expect(screen.getByTestId('card')).toHaveStyle({ opacity: 0 });
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByTestId('card')).toHaveStyle({ opacity: 1 });
  });

  it('com "Reduzir movimento" ligado no iPhone, o card aparece direto', async () => {
    reduzirMovimento(true);
    await render(
      <Card testID="card">
        <Text>oi</Text>
      </Card>,
    );
    await act(async () => {});

    expect(screen.getByTestId('card')).toHaveStyle({ opacity: 1 });
  });

  it('o anel enche animado, mas o leitor de tela já ouve o valor final', async () => {
    jest.useFakeTimers();
    reduzirMovimento(false);
    await render(<ProgressRing label="Missões do dia" value={67} />);

    expect(
      screen.getByRole('progressbar', { name: 'Missões do dia' }),
    ).toHaveAccessibilityValue({ now: 67 });
    expect(screen.getByTestId('anel-preenchimento')).toBeOnTheScreen();
  });

  it('o esqueleto pulsa, e fica parado com "Reduzir movimento"', async () => {
    reduzirMovimento(true);
    await render(<Skeleton height={40} />);
    await act(async () => {});

    expect(screen.getByRole('progressbar', { name: 'Carregando' })).toHaveStyle({
      opacity: 1,
    });
  });
});

describe('fonte grande do iPhone', () => {
  it('o anel cresce com a fonte, até 1,5×, para o texto do centro caber', async () => {
    tamanhoDaFonte(2);
    await render(<ProgressRing label="Calorias" value={10} />);

    expect(screen.getByRole('progressbar', { name: 'Calorias' })).toHaveStyle({
      width: 180,
      height: 180,
    });
  });

  it('com a fonte padrão, o anel fica no tamanho pedido', async () => {
    tamanhoDaFonte(1);
    await render(<ProgressRing label="Calorias" value={10} size={100} />);

    expect(screen.getByRole('progressbar', { name: 'Calorias' })).toHaveStyle({
      width: 100,
    });
  });

  it('números grandes crescem com limite, para não quebrar a linha', async () => {
    await render(<StatTile label="Sequência" value="10 dias" />);

    expect(screen.getByText('10 dias').props.maxFontSizeMultiplier).toBe(1.4);
  });
});
