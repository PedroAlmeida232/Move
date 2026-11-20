// Credencial errada, e-mail inexistente e senha errada têm a mesma mensagem
// de propósito: não revelamos se um e-mail tem conta.
const WRONG_CREDENTIALS = 'E-mail ou senha incorretos.';

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': WRONG_CREDENTIALS,
  'auth/wrong-password': WRONG_CREDENTIALS,
  'auth/user-not-found': WRONG_CREDENTIALS,
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests':
    'Muitas tentativas. Aguarde um pouco e tente de novo.',
  'auth/network-request-failed':
    'Sem conexão com a internet. Verifique e tente de novo.',
};

const GENERIC = 'Algo deu errado. Tente de novo.';

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return (typeof code === 'string' && MESSAGES[code]) || GENERIC;
}
