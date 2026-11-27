import { screen, userEvent, within } from '@testing-library/react-native';

import Dieta from '../app/(tabs)/dieta';
import { getMeals, postMeal } from '../src/features/meal/api';
import { fakeToday } from '../test-utils/fakeToday';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('../src/features/meal/api', () => ({
  getMeals: jest.fn(),
  postMeal: jest.fn(),
}));

const mockGetMeals = getMeals as jest.Mock;
const mockPostMeal = postMeal as jest.Mock;

const HOJE = '2026-11-20';
const goals = { kcal: 2000, protein: 140, carbs: 200, fat: 60 };
const almoco = {
  id: 'm1',
  date: HOJE,
  name: 'Almoço',
  kcal: 500,
  protein: 35,
  carbs: 50,
  fat: 15,
};
const dia = (meals = [almoco]) => ({ date: HOJE, goals, meals });

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date('2026-11-20T15:00:00Z'));
});
afterEach(() => jest.useRealTimers());

describe('Dieta: resumo do dia', () => {
  it('o anel de calorias mostra o consumido, a meta e quanto falta', async () => {
    mockGetMeals.mockResolvedValue(dia());
    await renderScreen(<Dieta />);

    const anel = await screen.findByRole('progressbar', { name: 'Calorias' });
    expect(anel).toHaveAccessibilityValue({ now: 25 });
    expect(within(anel).getByText('500')).toBeOnTheScreen();
    expect(within(anel).getByText('de 2000 kcal')).toBeOnTheScreen();
    expect(screen.getByText('Faltam 1500 kcal')).toBeOnTheScreen();
  });

  it('acima da meta, avisa quanto passou', async () => {
    mockGetMeals.mockResolvedValue(dia([{ ...almoco, kcal: 2300 }]));
    await renderScreen(<Dieta />);

    expect(await screen.findByText('300 kcal acima da meta')).toBeOnTheScreen();
  });

  it('as três barras de macros refletem os totais', async () => {
    mockGetMeals.mockResolvedValue(dia());
    await renderScreen(<Dieta />);

    await screen.findByText('Almoço');
    expect(
      screen.getByRole('progressbar', { name: 'Proteína' }),
    ).toHaveAccessibilityValue({ now: 25 });
    expect(
      screen.getByRole('progressbar', { name: 'Carboidratos' }),
    ).toHaveAccessibilityValue({ now: 25 });
    expect(
      screen.getByRole('progressbar', { name: 'Gorduras' }),
    ).toHaveAccessibilityValue({ now: 25 });
  });

  it('a refeição aparece como linha com as calorias e a proteína', async () => {
    mockGetMeals.mockResolvedValue(dia());
    await renderScreen(<Dieta />);

    expect(
      await screen.findByLabelText('Almoço, 35 g de proteína, 500 kcal'),
    ).toBeOnTheScreen();
  });

  it('carregando, mostra o esqueleto', async () => {
    mockGetMeals.mockReturnValue(new Promise(() => {}));
    await renderScreen(<Dieta />);

    expect(
      screen.getAllByRole('progressbar', { name: 'Carregando' }).length,
    ).toBeGreaterThan(0);
  });
});

describe('Dieta: folha de adicionar refeição', () => {
  it('o formulário só aparece ao abrir a folha, e Cancelar fecha', async () => {
    mockGetMeals.mockResolvedValue(dia());
    const user = userEvent.setup();
    await renderScreen(<Dieta />);
    await screen.findByText('Almoço');

    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Adicionar refeição' }));
    expect(screen.getByLabelText('Nome')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();
  });

  it('valida números positivos e continua aberta', async () => {
    mockGetMeals.mockResolvedValue(dia());
    const user = userEvent.setup();
    await renderScreen(<Dieta />);
    await screen.findByText('Almoço');

    await user.press(screen.getByRole('button', { name: 'Adicionar refeição' }));
    await user.type(screen.getByLabelText('Nome'), 'Lanche');
    await user.type(screen.getByLabelText('Calorias (kcal)'), '-5');
    await user.press(screen.getByRole('button', { name: 'Salvar refeição' }));

    expect(
      screen.getByText('Informe as calorias (número maior que zero).'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Nome')).toHaveDisplayValue('Lanche');
    expect(mockPostMeal).not.toHaveBeenCalled();
  });

  it('fecha ao salvar e a refeição entra no dia', async () => {
    mockGetMeals.mockResolvedValue(dia());
    mockPostMeal.mockImplementation(async (meal) => ({ id: 'm2', ...meal }));
    const user = userEvent.setup();
    await renderScreen(<Dieta />);
    await screen.findByText('Almoço');

    await user.press(screen.getByRole('button', { name: 'Adicionar refeição' }));
    await user.type(screen.getByLabelText('Nome'), 'Jantar');
    await user.type(screen.getByLabelText('Calorias (kcal)'), '700');
    await user.press(screen.getByRole('button', { name: 'Salvar refeição' }));

    expect(await screen.findByText('Jantar')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();
    expect(screen.getByText('Faltam 800 kcal')).toBeOnTheScreen();
  });
});
