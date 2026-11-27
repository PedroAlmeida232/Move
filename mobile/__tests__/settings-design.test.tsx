import { render, screen, userEvent } from '@testing-library/react-native';
import { Linking, Text } from 'react-native';

import Ajustes from '../app/ajustes';
import { SocialButtons } from '../src/features/auth/SocialButtons';
import { useAuth } from '../src/lib/auth';
import { POLICY_URL } from '../src/lib/links';
import { themes } from '../src/lib/theme';
import { AuthScreen } from '../src/lib/ui';
import { renderScreen } from '../test-utils/renderScreen';

jest.mock('../src/lib/auth', () => ({ useAuth: jest.fn() }));
jest.mock('../src/features/account/api', () => ({ deleteAccount: jest.fn() }));

const signOut = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  (useAuth as jest.Mock).mockReturnValue({
    signOut,
    signInWithApple: jest.fn(),
    signInWithGoogle: jest.fn(),
    user: { email: 'pedro@exemplo.com' },
  });
});

describe('login', () => {
  it('as telas de entrada mostram a logo do Move no topo', async () => {
    await render(
      <AuthScreen title="Entrar">
        <Text>formulário</Text>
      </AuthScreen>,
    );

    expect(screen.getByRole('image', { name: 'Move' })).toBeOnTheScreen();
  });

  it('Apple e Google têm o logo de cada um no botão', async () => {
    await render(<SocialButtons />);

    const opcoes = { includeHiddenElements: true };
    expect(screen.getByRole('button', { name: 'Continuar com Apple' })).toBeOnTheScreen();
    expect(screen.getByTestId('icone-logo-apple', opcoes)).toBeOnTheScreen();
    expect(screen.getByTestId('icone-logo-google', opcoes)).toBeOnTheScreen();
  });
});

describe('ajustes em lista agrupada', () => {
  it('mostra a conta com o e-mail e a aparência automática', async () => {
    await renderScreen(<Ajustes />);

    expect(screen.getByLabelText('E-mail, pedro@exemplo.com')).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Aparência, Automática, segue o iPhone'),
    ).toBeOnTheScreen();
  });

  it('a política de privacidade abre o link público', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    await user.press(
      screen.getByRole('button', { name: 'Política de privacidade' }),
    );

    expect(open).toHaveBeenCalledWith(POLICY_URL);
  });

  it('excluir conta fica por último, em vermelho, e pede confirmação', async () => {
    const user = userEvent.setup();
    await renderScreen(<Ajustes />);

    const botoes = screen.getAllByRole('button');
    const excluir = botoes[botoes.length - 1];
    expect(excluir).toHaveAccessibleName('Excluir conta');
    expect(screen.getByText('Excluir conta')).toHaveStyle({
      color: themes.light.danger,
    });

    await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
    expect(
      screen.getByRole('button', { name: 'Excluir definitivamente' }),
    ).toBeOnTheScreen();
  });
});
