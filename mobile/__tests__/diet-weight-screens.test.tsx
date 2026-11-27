import { render, screen, userEvent } from '@testing-library/react-native';

import Dieta from '../app/(tabs)/dieta';
import Peso from '../app/(tabs)/peso';
import { getMeals, postMeal, type DayMeals } from '../src/features/meal/api';
import { getWeights, putWeight } from '../src/features/weight/api';
import { fakeToday } from '../test-utils/fakeToday';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('../src/features/meal/api', () => ({
  getMeals: jest.fn(),
  postMeal: jest.fn(),
}));
jest.mock('../src/features/weight/api', () => ({
  getWeights: jest.fn(),
  putWeight: jest.fn(),
}));

const mockGetMeals = getMeals as jest.Mock;
const mockPostMeal = postMeal as jest.Mock;
const mockGetWeights = getWeights as jest.Mock;
const mockPutWeight = putWeight as jest.Mock;

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

beforeEach(() => {
  jest.resetAllMocks();
  fakeToday(new Date('2026-11-20T15:00:00Z'));
});

afterEach(() => jest.useRealTimers());

type User = ReturnType<typeof userEvent.setup>;

describe('tela Dieta', () => {
  const dia = (meals = [almoco]): DayMeals => ({ meals, goals });

  it('busca as refeições de hoje e mostra os totais e as barras de macros', async () => {
    mockGetMeals.mockResolvedValue(dia());
    await renderScreen(<Dieta />);

    expect(await screen.findByText('Faltam 1500 kcal')).toBeOnTheScreen();
    expect(mockGetMeals).toHaveBeenCalledWith(HOJE);
    expect(screen.getByText('35 / 140 g')).toBeOnTheScreen();
    expect(
      screen.getByRole('progressbar', { name: 'Calorias' }),
    ).toHaveAccessibilityValue({
      now: 25,
    });
    expect(
      screen.getByRole('progressbar', { name: 'Proteína' }),
    ).toHaveAccessibilityValue({
      now: 25,
    });
    expect(screen.getByText('Almoço')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Almoço, 35 g de proteína, 500 kcal'),
    ).toBeOnTheScreen();
  });

  it('mostra carregando, e o estado vazio sem refeições', async () => {
    let responder: (v: DayMeals) => void = () => {};
    mockGetMeals.mockReturnValue(new Promise((r) => (responder = r)));
    await renderScreen(<Dieta />);

    expect(
      screen.getAllByRole('progressbar', { name: 'Carregando' }).length,
    ).toBeGreaterThan(0);

    responder(dia([]));
    expect(await screen.findByText('Nenhuma refeição ainda')).toBeOnTheScreen();
    expect(screen.getByText('Faltam 2000 kcal')).toBeOnTheScreen();
  });

  it('erro ao carregar mostra mensagem e permite tentar de novo', async () => {
    mockGetMeals
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce(dia());
    const user = userEvent.setup();
    await renderScreen(<Dieta />);

    expect(
      await screen.findByText(
        'Não foi possível carregar as refeições. Verifique sua conexão.',
      ),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Almoço')).toBeOnTheScreen();
  });

  async function preencher(user: User, campos: Record<string, string>) {
    await user.press(
      screen.getByRole('button', { name: 'Adicionar refeição' }),
    );
    for (const [rotulo, texto] of Object.entries(campos)) {
      await user.type(screen.getByLabelText(rotulo), texto);
    }
    await user.press(screen.getByRole('button', { name: 'Salvar refeição' }));
  }

  it('adicionar refeição atualiza o total e as barras', async () => {
    mockGetMeals.mockResolvedValue(dia());
    mockPostMeal.mockImplementation(async (meal) => ({ id: 'm2', ...meal }));
    const user = userEvent.setup();
    await renderScreen(<Dieta />);
    await screen.findByText('Almoço');

    await preencher(user, {
      Nome: 'Jantar',
      'Calorias (kcal)': '700',
      'Proteína (g)': '35,5',
      'Carboidratos (g)': '60',
    });

    expect(mockPostMeal).toHaveBeenCalledWith({
      date: HOJE,
      name: 'Jantar',
      kcal: 700,
      protein: 35.5,
      carbs: 60,
      fat: 0,
    });
    expect(await screen.findByText('Faltam 800 kcal')).toBeOnTheScreen();
    expect(screen.getByText('71 / 140 g')).toBeOnTheScreen();
    expect(
      screen.getByRole('progressbar', { name: 'Calorias' }),
    ).toHaveAccessibilityValue({
      now: 60,
    });
    expect(screen.getByText('Jantar')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Nome')).not.toBeOnTheScreen();
  });

  it('valida os campos (números positivos) e não chama a API', async () => {
    mockGetMeals.mockResolvedValue(dia());
    const user = userEvent.setup();
    await renderScreen(<Dieta />);
    await screen.findByText('Almoço');

    await preencher(user, { 'Calorias (kcal)': '-5', 'Gorduras (g)': 'abc' });

    expect(screen.getByText('Informe o nome da refeição.')).toBeOnTheScreen();
    expect(
      screen.getByText('Informe as calorias (número maior que zero).'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Use um número positivo.')).toBeOnTheScreen();
    expect(mockPostMeal).not.toHaveBeenCalled();
    expect(screen.getByText('Faltam 1500 kcal')).toBeOnTheScreen();
  });

  it('erro ao salvar mostra mensagem e mantém o que foi digitado', async () => {
    mockGetMeals.mockResolvedValue(dia());
    mockPostMeal.mockRejectedValue(new Error('rede'));
    const user = userEvent.setup();
    await renderScreen(<Dieta />);
    await screen.findByText('Almoço');

    await preencher(user, { Nome: 'Jantar', 'Calorias (kcal)': '700' });

    expect(
      await screen.findByText(
        'Não foi possível salvar a refeição. Tente de novo.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Nome')).toHaveDisplayValue('Jantar');
    expect(screen.getByText('Faltam 1500 kcal')).toBeOnTheScreen();
  });
});

describe('tela Peso', () => {
  const registros = [
    { date: '2026-11-10', kg: 81.2, waistCm: null },
    { date: '2026-11-01', kg: 82, waistCm: null },
  ];

  it('busca os últimos 90 dias e mostra o gráfico e o último peso', async () => {
    mockGetWeights.mockResolvedValue(registros);
    await render(<Peso />);

    expect(
      await screen.findByRole('image', {
        name: 'Gráfico de peso: 2 registros, de 82 kg em 01/11 a 81,2 kg em 10/11',
      }),
    ).toBeOnTheScreen();
    expect(mockGetWeights).toHaveBeenCalledWith('2026-08-23', HOJE);
    expect(screen.getByText('81,2 kg')).toBeOnTheScreen();
  });

  it('mostra carregando e o estado vazio', async () => {
    let responder: (v: unknown[]) => void = () => {};
    mockGetWeights.mockReturnValue(new Promise((r) => (responder = r)));
    await render(<Peso />);

    expect(screen.getByText('Carregando peso…')).toBeOnTheScreen();

    responder([]);
    expect(
      await screen.findByText('Nenhum peso registrado ainda'),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('image')).not.toBeOnTheScreen();
  });

  it('erro ao carregar mostra mensagem e permite tentar de novo', async () => {
    mockGetWeights
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce(registros);
    const user = userEvent.setup();
    await render(<Peso />);

    expect(
      await screen.findByText(
        'Não foi possível carregar o peso. Verifique sua conexão.',
      ),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('81,2 kg')).toBeOnTheScreen();
  });

  async function registrar(user: User, texto: string) {
    await user.type(screen.getByLabelText('Peso de hoje (kg)'), texto);
    await user.press(screen.getByRole('button', { name: 'Registrar peso' }));
  }

  it('registrar peso atualiza o gráfico', async () => {
    mockGetWeights.mockResolvedValue(registros);
    mockPutWeight.mockImplementation(async (date, kg) => ({
      date,
      kg,
      waistCm: null,
    }));
    const user = userEvent.setup();
    await render(<Peso />);
    await screen.findByText('81,2 kg');

    await registrar(user, '80,4');

    expect(mockPutWeight).toHaveBeenCalledWith(HOJE, 80.4);
    expect(
      await screen.findByRole('image', {
        name: 'Gráfico de peso: 3 registros, de 82 kg em 01/11 a 80,4 kg em 20/11',
      }),
    ).toBeOnTheScreen();
    expect(screen.getByText('80,4 kg')).toBeOnTheScreen();
  });

  it('o segundo registro do mesmo dia substitui o primeiro', async () => {
    mockGetWeights.mockResolvedValue([
      ...registros,
      { date: HOJE, kg: 80.9, waistCm: null },
    ]);
    mockPutWeight.mockImplementation(async (date, kg) => ({
      date,
      kg,
      waistCm: null,
    }));
    const user = userEvent.setup();
    await render(<Peso />);
    await screen.findByText('80,9 kg');

    await registrar(user, '80,5');

    expect(
      await screen.findByRole('image', {
        name: 'Gráfico de peso: 3 registros, de 82 kg em 01/11 a 80,5 kg em 20/11',
      }),
    ).toBeOnTheScreen();
  });

  it('o primeiro registro faz o gráfico aparecer', async () => {
    mockGetWeights.mockResolvedValue([]);
    mockPutWeight.mockImplementation(async (date, kg) => ({
      date,
      kg,
      waistCm: null,
    }));
    const user = userEvent.setup();
    await render(<Peso />);
    await screen.findByText('Nenhum peso registrado ainda');

    await registrar(user, '83');

    expect(
      await screen.findByRole('image', {
        name: 'Gráfico de peso: 1 registro, de 83 kg em 20/11 a 83 kg em 20/11',
      }),
    ).toBeOnTheScreen();
  });

  it('valida o peso (20 a 400 kg) e não chama a API', async () => {
    mockGetWeights.mockResolvedValue(registros);
    const user = userEvent.setup();
    await render(<Peso />);
    await screen.findByText('81,2 kg');

    await registrar(user, '15');

    expect(
      screen.getByText('Informe um peso entre 20 e 400 kg.'),
    ).toBeOnTheScreen();
    expect(mockPutWeight).not.toHaveBeenCalled();
  });

  it('erro ao salvar mostra mensagem e mantém o gráfico', async () => {
    mockGetWeights.mockResolvedValue(registros);
    mockPutWeight.mockRejectedValue(new Error('rede'));
    const user = userEvent.setup();
    await render(<Peso />);
    await screen.findByText('81,2 kg');

    await registrar(user, '80');

    expect(
      await screen.findByText('Não foi possível salvar o peso. Tente de novo.'),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('image', { name: /2 registros/ }),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Peso de hoje (kg)')).toHaveDisplayValue('80');
  });
});
