import { authErrorMessage } from '../../src/domain/auth-errors';

describe('authErrorMessage', () => {
  it.each([
    ['auth/invalid-credential', 'E-mail ou senha incorretos.'],
    ['auth/wrong-password', 'E-mail ou senha incorretos.'],
    ['auth/user-not-found', 'E-mail ou senha incorretos.'],
    ['auth/invalid-email', 'Informe um e-mail válido.'],
    ['auth/email-already-in-use', 'Já existe uma conta com esse e-mail.'],
    ['auth/weak-password', 'A senha deve ter pelo menos 6 caracteres.'],
    ['auth/user-disabled', 'Esta conta foi desativada.'],
    [
      'auth/account-exists-with-different-credential',
      'Este e-mail já usa outra forma de entrar. Entre como da primeira vez.',
    ],
    [
      'auth/too-many-requests',
      'Muitas tentativas. Aguarde um pouco e tente de novo.',
    ],
    [
      'auth/network-request-failed',
      'Sem conexão com a internet. Verifique e tente de novo.',
    ],
  ])('traduz %s', (code, message) => {
    expect(authErrorMessage({ code })).toBe(message);
  });

  it('usa uma mensagem genérica para códigos desconhecidos e erros sem código', () => {
    const generic = 'Algo deu errado. Tente de novo.';
    expect(authErrorMessage({ code: 'auth/qualquer-outro' })).toBe(generic);
    expect(authErrorMessage(new Error('boom'))).toBe(generic);
    expect(authErrorMessage(null)).toBe(generic);
    expect(authErrorMessage('texto')).toBe(generic);
  });
});
