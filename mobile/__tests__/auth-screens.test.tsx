import { Linking, TextInput } from 'react-native';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';

import AuthLayout from '../app/(auth)/_layout';
import CriarConta from '../app/(auth)/criar-conta';
import Entrar from '../app/(auth)/entrar';
import RecuperarSenha from '../app/(auth)/recuperar-senha';
import NotFound from '../app/+not-found';
import RootLayout from '../app/_layout';
import TabsLayout from '../app/(tabs)/_layout';
import Hoje from '../app/(tabs)/index';
import Dieta from '../app/(tabs)/dieta';
import Peso from '../app/(tabs)/peso';
import Plano from '../app/(tabs)/plano';
import { getPlan } from '../src/features/workout/api';
import { POLICY_URL } from '../src/lib/links';

jest.mock('../src/features/workout/api', () => ({
  getPlan: jest.fn().mockResolvedValue({ days: [] }),
  postWorkout: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

const rotas = {
  _layout: RootLayout,
  '+not-found': NotFound,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': Hoje,
  '(tabs)/plano': Plano,
  '(tabs)/dieta': Dieta,
  '(tabs)/peso': Peso,
  '(auth)/_layout': AuthLayout,
  '(auth)/entrar': Entrar,
  '(auth)/criar-conta': CriarConta,
  '(auth)/recuperar-senha': RecuperarSenha,
};

let emitir: (user: { uid: string } | null) => void;

async function abrir(url: string, sessao: { uid: string } | null = null) {
  const app = await renderRouter(rotas, { initialUrl: url });
  await act(async () => emitir(sessao));
  return app;
}

async function digitar(
  user: ReturnType<typeof userEvent.setup>,
  campo: string,
  texto: string,
) {
  await user.type(screen.getByLabelText(campo), texto);
}

beforeEach(() => {
  jest.resetAllMocks();
  (getPlan as jest.Mock).mockResolvedValue({ days: [] });
  (getAuth as jest.Mock).mockReturnValue({});
  (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
    emitir = callback;
    return jest.fn();
  });
});

describe('guarda de rotas', () => {
  it('sem sessão, uma tela protegida redireciona para o login', async () => {
    const app = await abrir('/');

    expect(app.getPathname()).toBe('/entrar');
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeOnTheScreen();
    expect(
      screen.queryByRole('header', { name: 'Hoje' }),
    ).not.toBeOnTheScreen();
  });

  it('com sessão, mostra a tela inicial e tira o usuário do login', async () => {
    const app = await abrir('/entrar', { uid: 'u1' });

    expect(app.getPathname()).toBe('/');
    expect(screen.getByRole('header', { name: 'Hoje' })).toBeOnTheScreen();
  });

  it('não mostra nada enquanto a sessão ainda carrega', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    expect(
      screen.queryByRole('header', { name: 'Hoje' }),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Entrar' }),
    ).not.toBeOnTheScreen();
  });
});

describe('entrar', () => {
  it('e-mail inválido mostra erro e não chama o Firebase', async () => {
    const user = userEvent.setup();
    await abrir('/entrar');

    await digitar(user, 'E-mail', 'pedro');
    await digitar(user, 'Senha', 'segredo1');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByText('Informe um e-mail válido.')).toBeOnTheScreen();
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('senha com menos de 6 caracteres mostra erro', async () => {
    const user = userEvent.setup();
    await abrir('/entrar');

    await digitar(user, 'E-mail', 'pedro@move.app');
    await digitar(user, 'Senha', '12345');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      screen.getByText('A senha deve ter pelo menos 6 caracteres.'),
    ).toBeOnTheScreen();
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('erro do Firebase vira mensagem em português', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: 'auth/invalid-credential',
    });
    const user = userEvent.setup();
    await abrir('/entrar');

    await digitar(user, 'E-mail', 'pedro@move.app');
    await digitar(user, 'Senha', 'segredo1');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByText('E-mail ou senha incorretos.'),
    ).toBeOnTheScreen();
  });

  it('sucesso leva para a tela inicial', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockImplementation(async () => {
      emitir({ uid: 'u1' });
    });
    const user = userEvent.setup();
    const app = await abrir('/entrar');

    await digitar(user, 'E-mail', '  pedro@move.app ');
    await digitar(user, 'Senha', 'segredo1');
    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'pedro@move.app',
      'segredo1',
    );
    expect(
      await screen.findByRole('header', { name: 'Hoje' }),
    ).toBeOnTheScreen();
    expect(app.getPathname()).toBe('/');
  });

  it('leva para criar conta e para recuperar senha', async () => {
    const user = userEvent.setup();
    const app = await abrir('/entrar');

    await user.press(screen.getByRole('link', { name: 'Esqueci minha senha' }));
    expect(app.getPathname()).toBe('/recuperar-senha');

    await user.press(screen.getByRole('link', { name: 'Voltar para entrar' }));
    await user.press(screen.getByRole('link', { name: 'Criar conta' }));
    expect(app.getPathname()).toBe('/criar-conta');
  });
});

describe('criar conta', () => {
  async function preencher(user: ReturnType<typeof userEvent.setup>) {
    await digitar(user, 'E-mail', 'pedro@move.app');
    await digitar(user, 'Senha', 'segredo1');
  }

  it('exige o consentimento de dados de saúde', async () => {
    const user = userEvent.setup();
    await abrir('/criar-conta');

    await preencher(user);
    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      screen.getByText(
        'Para criar a conta, aceite o uso dos seus dados de saúde.',
      ),
    ).toBeOnTheScreen();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('mostra o link da política de privacidade', async () => {
    const abrirUrl = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as never);
    const user = userEvent.setup();
    await abrir('/criar-conta');

    await user.press(
      screen.getByRole('link', { name: 'Política de privacidade' }),
    );

    expect(abrirUrl).toHaveBeenCalledWith(POLICY_URL);
  });

  it('com consentimento, cria a conta e leva para a tela inicial', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockImplementation(
      async () => {
        emitir({ uid: 'u2' });
      },
    );
    const user = userEvent.setup();
    await abrir('/criar-conta');

    await preencher(user);
    await user.press(screen.getByRole('checkbox'));
    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'pedro@move.app',
      'segredo1',
    );
    expect(
      await screen.findByRole('header', { name: 'Hoje' }),
    ).toBeOnTheScreen();
  });

  it('valida e-mail e senha antes de chamar o Firebase', async () => {
    const user = userEvent.setup();
    await abrir('/criar-conta');

    await digitar(user, 'E-mail', 'pedro');
    await digitar(user, 'Senha', '123');
    await user.press(screen.getByRole('checkbox'));
    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByText('Informe um e-mail válido.')).toBeOnTheScreen();
    expect(
      screen.getByText('A senha deve ter pelo menos 6 caracteres.'),
    ).toBeOnTheScreen();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('e-mail já usado vira mensagem em português', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
      code: 'auth/email-already-in-use',
    });
    const user = userEvent.setup();
    await abrir('/criar-conta');

    await preencher(user);
    await user.press(screen.getByRole('checkbox'));
    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText('Já existe uma conta com esse e-mail.'),
    ).toBeOnTheScreen();
  });
});

describe('recuperar senha', () => {
  it('e-mail inválido mostra erro e não chama o Firebase', async () => {
    const user = userEvent.setup();
    await abrir('/recuperar-senha');

    await digitar(user, 'E-mail', 'pedro');
    await user.press(screen.getByRole('button', { name: 'Enviar link' }));

    expect(screen.getByText('Informe um e-mail válido.')).toBeOnTheScreen();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('envia o link e confirma sem revelar se o e-mail tem conta', async () => {
    (sendPasswordResetEmail as jest.Mock).mockRejectedValue({
      code: 'auth/user-not-found',
    });
    const user = userEvent.setup();
    await abrir('/recuperar-senha');

    await digitar(user, 'E-mail', 'pedro@move.app');
    await user.press(screen.getByRole('button', { name: 'Enviar link' }));

    expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, 'pedro@move.app');
    expect(
      await screen.findByText(
        'Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.',
      ),
    ).toBeOnTheScreen();
  });

  it('outros erros viram mensagem em português', async () => {
    (sendPasswordResetEmail as jest.Mock).mockRejectedValue({
      code: 'auth/network-request-failed',
    });
    const user = userEvent.setup();
    await abrir('/recuperar-senha');

    await digitar(user, 'E-mail', 'pedro@move.app');
    await user.press(screen.getByRole('button', { name: 'Enviar link' }));

    expect(
      await screen.findByText(
        'Sem conexão com a internet. Verifique e tente de novo.',
      ),
    ).toBeOnTheScreen();
  });
});

describe('acessibilidade: foco no campo com erro', () => {
  function focados(spy: jest.SpyInstance) {
    return spy.mock.contexts.map(
      (campo: { props: { accessibilityLabel: string } }) =>
        campo.props.accessibilityLabel,
    );
  }

  it.each([['/entrar'], ['/criar-conta']])(
    'em %s, vai para o e-mail e depois para a senha inválidos',
    async (rota) => {
      const foco = jest.spyOn(TextInput.prototype, 'focus');
      const user = userEvent.setup();
      await abrir(rota);

      await digitar(user, 'Senha', 'segredo1');
      await user.press(
        screen.getByRole('button', { name: /^(Entrar|Criar conta)$/ }),
      );
      expect(focados(foco)).toEqual(['E-mail']);

      await digitar(user, 'E-mail', 'pedro@move.app');
      await user.clear(screen.getByLabelText('Senha'));
      await digitar(user, 'Senha', '123');
      await user.press(
        screen.getByRole('button', { name: /^(Entrar|Criar conta)$/ }),
      );
      expect(focados(foco)).toEqual(['E-mail', 'Senha']);
    },
  );

  it('em recuperar senha, vai para o e-mail inválido', async () => {
    const foco = jest.spyOn(TextInput.prototype, 'focus');
    const user = userEvent.setup();
    await abrir('/recuperar-senha');

    await user.press(screen.getByRole('button', { name: 'Enviar link' }));

    expect(focados(foco)).toEqual(['E-mail']);
  });

  it('os erros são anunciados como alerta', async () => {
    const user = userEvent.setup();
    await abrir('/entrar');

    await user.press(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });
});
