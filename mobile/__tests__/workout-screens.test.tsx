import { render, screen, userEvent } from '@testing-library/react-native';

import Hoje from '../app/(tabs)/index';
import Plano from '../app/(tabs)/plano';
import { getPlan, postWorkout, type Plan } from '../src/features/workout/api';
import { renderScreen } from '../test-utils/renderScreen';

// O histórico do progresso (usado na celebração) não é o foco aqui: falha em silêncio.
jest.mock('../src/lib/api', () => ({ apiFetch: jest.fn() }));

jest.mock('../src/features/workout/api', () => ({
  getPlan: jest.fn(),
  postWorkout: jest.fn(),
}));

const mockGetPlan = getPlan as jest.Mock;
const mockPostWorkout = postWorkout as jest.Mock;

// 2026-11-20 é sexta-feira (5).
const AGORA = new Date('2026-11-20T15:00:00Z');

const plano: Plan = {
  days: [
    {
      weekday: 5,
      name: 'Costas e postura',
      exercises: [
        { id: 'e1', name: 'Serrote', sets: 2, reps: '10 a 12' },
        { id: 'e2', name: 'Face pull', sets: 2, reps: '12' },
      ],
    },
    {
      weekday: 1,
      name: 'Peito e ombros',
      exercises: [
        { id: 'e3', name: 'Supino com halteres', sets: 3, reps: '8' },
      ],
    },
  ],
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers({
    now: AGORA,
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'nextTick',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'performance',
    ],
  });
});

afterEach(() => jest.useRealTimers());

describe('tela Hoje', () => {
  it('mostra o treino do dia da semana atual', async () => {
    mockGetPlan.mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Hoje />);

    expect(await screen.findByText('Costas e postura')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Começar treino' }));
    expect(screen.getByText('Serrote')).toBeOnTheScreen();
    expect(screen.getByText('Face pull')).toBeOnTheScreen();
    expect(screen.queryByText('Supino com halteres')).not.toBeOnTheScreen();
    expect(screen.getByText('0 de 4 séries')).toBeOnTheScreen();
  });

  it('mostra o estado de carregando enquanto busca o plano', async () => {
    mockGetPlan.mockReturnValue(new Promise(() => {}));
    await renderScreen(<Hoje />);

    expect(
      screen.getAllByRole('progressbar', { name: 'Carregando' }).length,
    ).toBeGreaterThan(0);
  });

  it('mostra dia livre quando o dia de hoje não tem exercícios', async () => {
    mockGetPlan.mockResolvedValue({ days: [plano.days[1]] });
    await renderScreen(<Hoje />);

    expect(await screen.findByText('Dia de descanso')).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Concluir treino' }),
    ).not.toBeOnTheScreen();
  });

  it('mostra o estado vazio quando o usuário ainda não tem plano', async () => {
    mockGetPlan.mockResolvedValue({ days: [] });
    await renderScreen(<Hoje />);

    expect(
      await screen.findByText('Você ainda não tem um plano de treino.'),
    ).toBeOnTheScreen();
  });

  it('erro de rede mostra mensagem e permite tentar de novo', async () => {
    // A primeira busca (a do treino) falha; as seguintes funcionam.
    mockGetPlan.mockRejectedValueOnce(new Error('Network request failed'));
    mockGetPlan.mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Hoje />);

    expect(
      await screen.findByText(
        'Não foi possível carregar o treino. Verifique sua conexão.',
      ),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Costas e postura')).toBeOnTheScreen();
  });

  it('marcar uma série atualiza o progresso do treino', async () => {
    mockGetPlan.mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Hoje />);
    await screen.findByText('Costas e postura');
    await user.press(screen.getByRole('button', { name: 'Começar treino' }));

    await user.press(
      screen.getByRole('checkbox', { name: 'Concluir série 1 de Serrote' }),
    );

    expect(screen.getByText('1 de 4 séries')).toBeOnTheScreen();
    expect(
      screen.getByRole('checkbox', {
        name: 'Concluir série 1 de Serrote',
        checked: true,
      }),
    ).toBeOnTheScreen();

    await user.press(
      screen.getByRole('checkbox', { name: 'Concluir série 1 de Serrote' }),
    );

    expect(screen.getByText('0 de 4 séries')).toBeOnTheScreen();
  });

  it('só permite concluir o treino quando todas as séries estão feitas', async () => {
    mockGetPlan.mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Hoje />);
    await screen.findByText('Costas e postura');
    await user.press(screen.getByRole('button', { name: 'Começar treino' }));

    expect(
      screen.getByRole('button', { name: 'Concluir treino' }),
    ).toBeDisabled();

    await user.press(
      screen.getByRole('checkbox', { name: 'Concluir série 1 de Serrote' }),
    );
    await user.press(screen.getByRole('button', { name: 'Concluir treino' }));

    expect(mockPostWorkout).not.toHaveBeenCalled();
  });

  async function fazerTudo(user: ReturnType<typeof userEvent.setup>) {
    await user.type(
      screen.getByLabelText('Carga da série 1 de Serrote'),
      '12,5',
    );
    await user.type(
      screen.getByLabelText('Repetições da série 1 de Serrote'),
      '10',
    );
    for (const nome of ['Serrote', 'Face pull']) {
      for (const n of [1, 2]) {
        await user.press(
          screen.getByRole('checkbox', {
            name: `Concluir série ${n} de ${nome}`,
          }),
        );
      }
    }
  }

  it('concluir o treino chama POST /workouts e mostra a confirmação', async () => {
    mockGetPlan.mockResolvedValue(plano);
    mockPostWorkout.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await renderScreen(<Hoje />);
    await screen.findByText('Costas e postura');
    await user.press(screen.getByRole('button', { name: 'Começar treino' }));

    await fazerTudo(user);
    await user.press(screen.getByRole('button', { name: 'Concluir treino' }));

    expect(await screen.findByText('Treino concluído!')).toBeOnTheScreen();
    expect(mockPostWorkout).toHaveBeenCalledTimes(1);
    expect(mockPostWorkout).toHaveBeenCalledWith({
      performedAt: AGORA.toISOString(),
      finished: true,
      sets: [
        { exerciseId: 'e1', setNumber: 1, kg: 12.5, reps: 10, done: true },
        { exerciseId: 'e1', setNumber: 2, kg: null, reps: null, done: true },
        { exerciseId: 'e2', setNumber: 1, kg: null, reps: null, done: true },
        { exerciseId: 'e2', setNumber: 2, kg: null, reps: null, done: true },
      ],
    });
    expect(
      screen.queryByRole('button', { name: 'Concluir treino' }),
    ).not.toBeOnTheScreen();
  });

  it('erro de rede ao concluir mostra mensagem e permite tentar de novo', async () => {
    mockGetPlan.mockResolvedValue(plano);
    mockPostWorkout.mockRejectedValueOnce(new Error('Network request failed'));
    mockPostWorkout.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    await renderScreen(<Hoje />);
    await screen.findByText('Costas e postura');
    await user.press(screen.getByRole('button', { name: 'Começar treino' }));

    await fazerTudo(user);
    await user.press(screen.getByRole('button', { name: 'Concluir treino' }));

    expect(
      await screen.findByText(
        'Não foi possível salvar o treino. Tente de novo.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText('4 de 4 séries')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Concluir treino' }));

    expect(await screen.findByText('Treino concluído!')).toBeOnTheScreen();
    expect(mockPostWorkout).toHaveBeenCalledTimes(2);
  });
});

describe('tela Plano', () => {
  it('abre no dia de hoje e mostra os exercícios do plano', async () => {
    mockGetPlan.mockResolvedValue(plano);
    await renderScreen(<Plano />);

    expect(await screen.findByText('Costas e postura')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Sex', selected: true }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Serrote')).toBeOnTheScreen();
    expect(screen.getByText('2 × 10 a 12')).toBeOnTheScreen();
  });

  it('troca o dia da semana', async () => {
    mockGetPlan.mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Plano />);
    await screen.findByText('Costas e postura');

    await user.press(screen.getByRole('button', { name: 'Seg' }));

    expect(screen.getByText('Peito e ombros')).toBeOnTheScreen();
    expect(screen.getByText('Supino com halteres')).toBeOnTheScreen();
    expect(screen.queryByText('Serrote')).not.toBeOnTheScreen();
  });

  it('mostra descanso em dia sem exercícios', async () => {
    mockGetPlan.mockResolvedValue(plano);
    const user = userEvent.setup();
    await renderScreen(<Plano />);
    await screen.findByText('Costas e postura');

    await user.press(screen.getByRole('button', { name: 'Dom' }));

    expect(screen.getByText('Dia de descanso')).toBeOnTheScreen();
  });

  it('mostra carregando e erro com nova tentativa', async () => {
    mockGetPlan.mockRejectedValueOnce(new Error('x'));
    mockGetPlan.mockResolvedValueOnce(plano);
    const user = userEvent.setup();
    await renderScreen(<Plano />);

    expect(
      await screen.findByText(
        'Não foi possível carregar o treino. Verifique sua conexão.',
      ),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Costas e postura')).toBeOnTheScreen();
  });

  it('mostra o estado de carregando', async () => {
    mockGetPlan.mockReturnValue(new Promise(() => {}));
    await renderScreen(<Plano />);

    expect(
      screen.getAllByRole('progressbar', { name: 'Carregando' }).length,
    ).toBeGreaterThan(0);
  });
});
