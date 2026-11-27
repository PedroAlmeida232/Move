import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { userEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import NotFound from '../app/+not-found';
import RootLayout from '../app/_layout';
import Ajustes from '../app/ajustes';
import TabsLayout, { TAB_ICONS, tabIcon } from '../app/(tabs)/_layout';
import Hoje from '../app/(tabs)/index';
import Dieta from '../app/(tabs)/dieta';
import Peso from '../app/(tabs)/peso';
import Plano from '../app/(tabs)/plano';
import Progresso from '../app/(tabs)/progresso';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('../src/features/account/api', () => ({ deleteAccount: jest.fn() }));
jest.mock('../src/features/workout/api', () => ({
  getPlan: jest.fn(),
  getWorkouts: jest.fn(),
  postWorkout: jest.fn(),
}));
jest.mock('../src/features/meal/api', () => ({
  getMeals: jest.fn(),
  getMealHistory: jest.fn(),
  postMeal: jest.fn(),
}));
jest.mock('../src/features/weight/api', () => ({
  getWeights: jest.fn(),
  putWeight: jest.fn(),
}));
jest.mock('../src/features/progress/api', () => ({
  getAchievements: jest.fn(),
}));
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('expo-apple-authentication', () => ({}));
jest.mock('expo-crypto', () => ({}));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {},
  statusCodes: {},
}));

const rotas = {
  _layout: RootLayout,
  '+not-found': NotFound,
  ajustes: Ajustes,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': Hoje,
  '(tabs)/plano': Plano,
  '(tabs)/dieta': Dieta,
  '(tabs)/peso': Peso,
  '(tabs)/progresso': Progresso,
};

let emitir: (user: { uid: string } | null) => void;

async function abrir(url: string) {
  const app = await renderRouter(rotas, { initialUrl: url });
  await act(async () => emitir({ uid: 'u1' }));
  return app;
}

beforeEach(() => {
  jest.resetAllMocks();
  (getAuth as jest.Mock).mockReturnValue({});
  (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
    emitir = callback;
    return jest.fn();
  });
  // As telas ficam carregando: aqui só importa a navegação.
  for (const modulo of [
    '../src/features/workout/api',
    '../src/features/meal/api',
    '../src/features/weight/api',
    '../src/features/progress/api',
  ]) {
    for (const fn of Object.values(jest.requireMock(modulo)))
      (fn as jest.Mock).mockReturnValue(new Promise(() => {}));
  }
});

const ABAS = ['Hoje', 'Plano', 'Dieta', 'Peso', 'Progresso'];

describe('abas', () => {
  it.each(ABAS)('a aba %s tem rótulo acessível em português', async (nome) => {
    await abrir('/');
    expect(screen.getByRole('button', { name: nome })).toBeOnTheScreen();
  });

  it('a aba aberta fica marcada como selecionada', async () => {
    await abrir('/plano');
    expect(screen.getByRole('button', { name: 'Plano' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Hoje' })).not.toBeSelected();
    expect(screen.getByTestId('icone-barbell', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByTestId('icone-today-outline', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('cada aba tem ícone de contorno quando inativa e preenchido quando ativa', () => {
    expect(Object.keys(TAB_ICONS).sort()).toEqual(
      ['dieta', 'index', 'peso', 'plano', 'progresso'],
    );
    for (const route of Object.keys(TAB_ICONS)) {
      const ativo = tabIcon(route, true);
      const inativo = tabIcon(route, false);
      expect(inativo).toBe(`${ativo}-outline`);
    }
  });

  it('trocar de aba vibra de leve e abre a tela', async () => {
    const user = userEvent.setup();
    const app = await abrir('/');

    await user.press(screen.getByRole('button', { name: 'Peso' }));

    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    expect(app.getPathname()).toBe('/peso');
  });
});

describe('ajustes no topo', () => {
  it('o ícone de Ajustes na tela Hoje abre os Ajustes', async () => {
    const user = userEvent.setup();
    const app = await abrir('/');

    await user.press(screen.getByRole('button', { name: 'Ajustes' }));

    expect(app.getPathname()).toBe('/ajustes');
  });
});
