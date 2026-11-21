import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from '@react-native-firebase/auth';
import { userEvent } from '@testing-library/react-native';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import AuthLayout from '../app/(auth)/_layout';
import Entrar from '../app/(auth)/entrar';
import NotFound from '../app/+not-found';
import RootLayout from '../app/_layout';
import Ajustes from '../app/ajustes';
import TabsLayout from '../app/(tabs)/_layout';
import Hoje from '../app/(tabs)/index';
import Dieta from '../app/(tabs)/dieta';
import Peso from '../app/(tabs)/peso';
import Plano from '../app/(tabs)/plano';
import Progresso from '../app/(tabs)/progresso';
import { deleteAccount } from '../src/features/account/api';

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
  '(auth)/_layout': AuthLayout,
  '(auth)/entrar': Entrar,
};

const mockDelete = deleteAccount as jest.Mock;
const mockSignOut = signOut as jest.Mock;
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
  // O Firebase avisa que a sessão acabou depois do signOut.
  mockSignOut.mockImplementation(async () => emitir(null));
  // As telas das abas ficam carregando: aqui só importam os Ajustes.
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

describe('ajustes', () => {
  it('abre a partir da aba Progresso', async () => {
    const user = userEvent.setup();
    const app = await abrir('/progresso');

    await user.press(screen.getByRole('link', { name: 'Ajustes' }));

    expect(app.getPathname()).toBe('/ajustes');
    expect(
      screen.getByRole('button', { name: 'Excluir conta' }),
    ).toBeOnTheScreen();
  });

  it('Sair encerra a sessão e volta para o login', async () => {
    const user = userEvent.setup();
    const app = await abrir('/ajustes');

    await user.press(screen.getByRole('button', { name: 'Sair' }));

    expect(mockSignOut).toHaveBeenCalled();
    expect(app.getPathname()).toBe('/entrar');
  });
});

describe('excluir conta', () => {
  it('pede confirmação antes de excluir', async () => {
    const user = userEvent.setup();
    await abrir('/ajustes');

    await user.press(screen.getByRole('button', { name: 'Excluir conta' }));

    expect(
      screen.getByText(/apaga para sempre seus treinos, refeições, pesos/),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    ).toBeOnTheScreen();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('Cancelar desiste sem chamar a API', async () => {
    const user = userEvent.setup();
    await abrir('/ajustes');

    await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
    await user.press(screen.getByRole('button', { name: 'Cancelar' }));

    expect(
      screen.queryByRole('button', { name: 'Excluir definitivamente' }),
    ).not.toBeOnTheScreen();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('confirmada, exclui na API, encerra a sessão e volta para o login', async () => {
    const user = userEvent.setup();
    mockDelete.mockResolvedValue(undefined);
    const app = await abrir('/ajustes');

    await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
    await user.press(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    );

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalled();
    expect(app.getPathname()).toBe('/entrar');
  });

  it('fica ocupado enquanto exclui, sem permitir dois toques', async () => {
    const user = userEvent.setup();
    mockDelete.mockReturnValue(new Promise(() => {}));
    await abrir('/ajustes');

    await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
    await user.press(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    );

    expect(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('se a API falha, avisa e mantém a sessão', async () => {
    const user = userEvent.setup();
    mockDelete.mockRejectedValue(new Error('500'));
    const app = await abrir('/ajustes');

    await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
    await user.press(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    );

    expect(
      screen.getByText('Não foi possível excluir a conta. Tente de novo.'),
    ).toBeOnTheScreen();
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(app.getPathname()).toBe('/ajustes');
    expect(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    ).toBeEnabled();
  });
});
