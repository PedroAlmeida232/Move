import { screen, userEvent } from '@testing-library/react-native';
import * as Sharing from 'expo-sharing';

import Ajustes from '../app/ajustes';
import { getMealHistory } from '../src/features/meal/api';
import { getAchievements } from '../src/features/progress/api';
import { getWeights } from '../src/features/weight/api';
import { getPlan, getWorkouts } from '../src/features/workout/api';
import { useAuth } from '../src/lib/auth';
import { fakeToday } from '../test-utils/fakeToday';
import { renderScreen } from '../test-utils/renderScreen';

const mockWrite = jest.fn();
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'cache' },
  File: jest.fn().mockImplementation((_dir: string, name: string) => ({
    uri: `file:///cache/${name}`,
    create: jest.fn(),
    write: (text: string) => mockWrite(name, text),
  })),
}));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('../src/lib/auth', () => ({ useAuth: jest.fn() }));
jest.mock('../src/features/account/api', () => ({ deleteAccount: jest.fn() }));
jest.mock('../src/features/workout/api', () => ({
  getPlan: jest.fn(),
  getWorkouts: jest.fn(),
}));
jest.mock('../src/features/meal/api', () => ({ getMealHistory: jest.fn() }));
jest.mock('../src/features/weight/api', () => ({ getWeights: jest.fn() }));
jest.mock('../src/features/progress/api', () => ({ getAchievements: jest.fn() }));

const goals = { kcal: 2000, protein: 140, carbs: 200, fat: 60 };

function dados() {
  (getPlan as jest.Mock).mockResolvedValue({ days: [] });
  (getWorkouts as jest.Mock).mockResolvedValue([]);
  (getMealHistory as jest.Mock).mockResolvedValue({ goals, meals: [] });
  (getWeights as jest.Mock).mockResolvedValue([{ date: '2026-11-20', kg: 80, waistCm: null }]);
  (getAchievements as jest.Mock).mockResolvedValue([]);
}

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date(2026, 10, 27, 17, 0));
  (useAuth as jest.Mock).mockReturnValue({
    signOut: jest.fn(),
    user: { email: 'pedro@exemplo.com' },
  });
});
afterEach(() => jest.useRealTimers());

describe('exportar meus dados', () => {
  it('busca tudo, grava o arquivo do dia e abre o compartilhamento', async () => {
    dados();
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(screen.getByRole('button', { name: 'Exportar meus dados' }));

    expect(await screen.findByText('Dados exportados')).toBeOnTheScreen();
    expect(getWeights).toHaveBeenCalledWith();
    const [nome, texto] = mockWrite.mock.calls[0];
    expect(nome).toBe('move-dados-2026-11-27.json');
    const arquivo = JSON.parse(texto);
    expect(arquivo).toMatchObject({
      app: 'Move',
      conta: { email: 'pedro@exemplo.com' },
      pesos: [{ date: '2026-11-20', kg: 80, waistCm: null }],
      metas: goals,
    });
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      'file:///cache/move-dados-2026-11-27.json',
      expect.objectContaining({ mimeType: 'application/json', UTI: 'public.json' }),
    );
  });

  it('se alguma busca falhar, avisa e deixa tentar de novo', async () => {
    dados();
    (getWorkouts as jest.Mock).mockRejectedValueOnce(new Error('rede'));
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(screen.getByRole('button', { name: 'Exportar meus dados' }));

    expect(
      await screen.findByText('Não foi possível exportar seus dados. Tente de novo.'),
    ).toBeOnTheScreen();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Exportar meus dados' }));
    expect(await screen.findByText('Dados exportados')).toBeOnTheScreen();
  });

  it('enquanto prepara, avisa e ignora novos toques', async () => {
    dados();
    (getPlan as jest.Mock).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(screen.getByRole('button', { name: 'Exportar meus dados' }));
    expect(
      screen.getByRole('button', { name: 'Exportar meus dados, Preparando…' }),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Exportar meus dados, Preparando…' }));
    expect(getPlan).toHaveBeenCalledTimes(1);
  });
});
