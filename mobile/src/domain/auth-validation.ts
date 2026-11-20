const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 6;

/** Devolve a mensagem de erro, ou `null` se o e-mail é válido. */
export function validateEmail(email: string): string | null {
  return EMAIL.test(email.trim()) ? null : 'Informe um e-mail válido.';
}

/** Devolve a mensagem de erro, ou `null` se a senha é válida. */
export function validatePassword(password: string): string | null {
  return password.length >= MIN_PASSWORD_LENGTH
    ? null
    : `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
}
