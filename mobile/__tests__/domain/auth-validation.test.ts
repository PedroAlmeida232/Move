import { validateEmail, validatePassword } from '../../src/domain/auth-validation';

describe('validateEmail', () => {
  it.each(['', '   ', 'pedro', 'pedro@', '@move.app', 'pedro@move', 'a b@move.app'])(
    'rejeita "%s"',
    (email) => {
      expect(validateEmail(email)).toBe('Informe um e-mail válido.');
    },
  );

  it.each(['pedro@move.app', '  pedro@move.app  ', 'a.b+c@sub.dominio.com.br'])(
    'aceita "%s"',
    (email) => {
      expect(validateEmail(email)).toBeNull();
    },
  );
});

describe('validatePassword', () => {
  it('rejeita senha vazia ou com menos de 6 caracteres', () => {
    expect(validatePassword('')).toBe('A senha deve ter pelo menos 6 caracteres.');
    expect(validatePassword('12345')).toBe('A senha deve ter pelo menos 6 caracteres.');
  });

  it('aceita 6 caracteres ou mais (limite inclusivo)', () => {
    expect(validatePassword('123456')).toBeNull();
    expect(validatePassword('uma senha longa')).toBeNull();
  });
});
