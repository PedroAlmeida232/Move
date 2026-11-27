import { screen, userEvent } from '@testing-library/react-native';

import Peso from '../app/(tabs)/peso';
import { getWeights, putWeight } from '../src/features/weight/api';
import { themes } from '../src/lib/theme';
import { fakeToday } from '../test-utils/fakeToday';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('../src/features/weight/api', () => ({
  getWeights: jest.fn(),
  putWeight: jest.fn(),
}));

const mockGetWeights = getWeights as jest.Mock;
const mockPutWeight = putWeight as jest.Mock;
const HOJE = '2026-11-20';
const registro = (date: string, kg: number) => ({ date, kg, waistCm: null });

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date('2026-11-20T15:00:00Z'));
});
afterEach(() => jest.useRealTimers());

describe('Peso: resumo', () => {
  it('mostra o peso atual e a perda no período em verde, com sinal de menos', async () => {
    mockGetWeights.mockResolvedValue([
      registro('2026-11-01', 82),
      registro('2026-11-10', 81.2),
    ]);
    await renderScreen(<Peso />);

    expect(await screen.findByLabelText('Peso atual: 81,2 kg')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Variação em 90 dias: −0,8 kg'),
    ).toBeOnTheScreen();
    expect(screen.getByText('−0,8 kg')).toHaveStyle({
      color: themes.light.sucesso,
    });
  });

  it('ganho aparece com sinal de mais e sem a cor de perda', async () => {
    mockGetWeights.mockResolvedValue([
      registro('2026-11-01', 80),
      registro('2026-11-10', 80.6),
    ]);
    await renderScreen(<Peso />);

    const ganho = await screen.findByText('+0,6 kg');
    expect(ganho).toHaveStyle({ color: themes.light.ink });
  });

  it('carregando, mostra o esqueleto', async () => {
    mockGetWeights.mockReturnValue(new Promise(() => {}));
    await renderScreen(<Peso />);

    expect(
      screen.getAllByRole('progressbar', { name: 'Carregando' }).length,
    ).toBeGreaterThan(0);
  });
});

describe('Peso: filtro do período', () => {
  it('abre em 90 dias e trocar o filtro muda o intervalo pedido', async () => {
    mockGetWeights.mockResolvedValue([registro('2026-11-10', 81.2)]);
    const user = userEvent.setup();
    await renderScreen(<Peso />);
    await screen.findByLabelText('Peso atual: 81,2 kg');

    expect(mockGetWeights).toHaveBeenLastCalledWith('2026-08-23', HOJE);
    expect(screen.getByRole('button', { name: '90 dias' })).toBeSelected();

    await user.press(screen.getByRole('button', { name: '30 dias' }));
    expect(mockGetWeights).toHaveBeenLastCalledWith('2026-10-22', HOJE);
    expect(await screen.findByLabelText(/Variação em 30 dias/)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Tudo' }));
    expect(mockGetWeights).toHaveBeenLastCalledWith();
    expect(await screen.findByLabelText(/Variação no total/)).toBeOnTheScreen();
  });
});

describe('Peso: registrar pela folha', () => {
  it('abre a folha, salva e fecha', async () => {
    mockGetWeights.mockResolvedValue([registro('2026-11-10', 81.2)]);
    mockPutWeight.mockResolvedValue(registro(HOJE, 80.4));
    const user = userEvent.setup();
    await renderScreen(<Peso />);
    await screen.findByLabelText('Peso atual: 81,2 kg');

    expect(screen.queryByLabelText('Peso de hoje (kg)')).not.toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Registrar peso' }));
    await user.type(screen.getByLabelText('Peso de hoje (kg)'), '80,4');
    await user.press(screen.getByRole('button', { name: 'Salvar peso' }));

    expect(mockPutWeight).toHaveBeenCalledWith(HOJE, 80.4);
    expect(await screen.findByLabelText('Peso atual: 80,4 kg')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Peso de hoje (kg)')).not.toBeOnTheScreen();
  });
});
