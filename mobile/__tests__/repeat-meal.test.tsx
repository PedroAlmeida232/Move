import { screen, userEvent, within } from '@testing-library/react-native';

import Dieta from '../app/(tabs)/dieta';
import { getMealHistory, getMeals, postMeal } from '../src/features/meal/api';
import { fakeToday } from '../test-utils/fakeToday';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('../src/features/meal/api', () => ({
  getMeals: jest.fn(),
  getMealHistory: jest.fn(),
  postMeal: jest.fn(),
}));

const mocks = {
  day: getMeals as jest.Mock,
  history: getMealHistory as jest.Mock,
  post: postMeal as jest.Mock,
};

const HOJE = '2026-11-20';
const goals = { kcal: 2000, protein: 140, carbs: 200, fat: 60 };
const refeicao = (date: string, name: string, kcal: number) => ({
  id: `${date}-${name}`,
  date,
  name,
  kcal,
  protein: 30,
  carbs: 40,
  fat: 10,
});

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date('2026-11-20T15:00:00Z'));
  mocks.day.mockResolvedValue({ date: HOJE, goals, meals: [] });
});
afterEach(() => jest.useRealTimers());

async function abrirFolha() {
  const user = userEvent.setup();
  await renderScreen(<Dieta />);
  await screen.findByText('Faltam 2000 kcal');
  await user.press(screen.getByRole('button', { name: 'Adicionar refeição' }));
  return user;
}

describe('repetir refeição', () => {
  it('a folha mostra as refeições recentes, sem repetidas, das mais novas para as mais antigas', async () => {
    mocks.history.mockResolvedValue({
      goals,
      meals: [
        refeicao('2026-11-17', 'Almoço', 650),
        refeicao('2026-11-18', 'Café da manhã', 350),
        refeicao('2026-11-19', 'almoço', 700),
      ],
    });
    await abrirFolha();

    const recentes = await screen.findByLabelText('Refeições recentes');
    const linhas = within(recentes).getAllByRole('button');
    expect(linhas.map((l) => l.props.accessibilityLabel)).toEqual([
      'almoço, 700 kcal',
      'Café da manhã, 350 kcal',
    ]);
  });

  it('um toque registra a refeição para hoje com os mesmos valores e fecha a folha', async () => {
    mocks.history.mockResolvedValue({
      goals,
      meals: [refeicao('2026-11-19', 'Almoço', 700)],
    });
    mocks.post.mockImplementation(async (meal) => ({ id: 'novo', ...meal }));
    const user = await abrirFolha();

    await user.press(await screen.findByRole('button', { name: 'Almoço, 700 kcal' }));

    expect(mocks.post).toHaveBeenCalledWith({
      date: HOJE,
      name: 'Almoço',
      kcal: 700,
      protein: 30,
      carbs: 40,
      fat: 10,
    });
    expect(await screen.findByText('Faltam 1300 kcal')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();
  });

  it('se repetir falhar, avisa e a folha continua aberta', async () => {
    mocks.history.mockResolvedValue({
      goals,
      meals: [refeicao('2026-11-19', 'Almoço', 700)],
    });
    mocks.post.mockRejectedValue(new Error('rede'));
    const user = await abrirFolha();

    await user.press(await screen.findByRole('button', { name: 'Almoço, 700 kcal' }));

    expect(
      await screen.findByText('Não foi possível salvar a refeição. Tente de novo.'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Nome')).toBeOnTheScreen();
  });

  it('sem histórico, não há a seção de recentes', async () => {
    mocks.history.mockResolvedValue({ goals, meals: [] });
    await abrirFolha();

    expect(screen.getByLabelText('Nome')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Refeições recentes')).not.toBeOnTheScreen();
  });

  it('se o histórico falhar, o formulário funciona do mesmo jeito', async () => {
    mocks.history.mockRejectedValue(new Error('rede'));
    await abrirFolha();

    expect(screen.getByLabelText('Nome')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Refeições recentes')).not.toBeOnTheScreen();
  });

  it('uma refeição nova entra nas recentes na próxima vez', async () => {
    mocks.history.mockResolvedValue({ goals, meals: [] });
    mocks.post.mockImplementation(async (meal) => ({ id: 'novo', ...meal }));
    const user = await abrirFolha();

    await user.type(screen.getByLabelText('Nome'), 'Jantar');
    await user.type(screen.getByLabelText('Calorias (kcal)'), '500');
    await user.press(screen.getByRole('button', { name: 'Salvar refeição' }));
    await screen.findByText('Faltam 1500 kcal');

    await user.press(screen.getByRole('button', { name: 'Adicionar refeição' }));
    expect(screen.getByRole('button', { name: 'Jantar, 500 kcal' })).toBeOnTheScreen();
  });
});
