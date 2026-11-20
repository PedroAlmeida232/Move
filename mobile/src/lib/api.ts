import { getAuth, signOut } from '@react-native-firebase/auth';

async function enviar(path: string, init: RequestInit, forceRefresh: boolean) {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Sem sessão');

  const token = await user.getIdToken(forceRefresh);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
  });
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const resposta = await enviar(path, init, false);
  if (resposta.status !== 401) return resposta;

  const segunda = await enviar(path, init, true);
  if (segunda.status !== 401) return segunda;

  await signOut(getAuth());
  throw new Error('Sessão expirada');
}
