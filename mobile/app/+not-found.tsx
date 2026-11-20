import { Redirect } from 'expo-router';

import { useAuth } from '../src/lib/auth';

// Rota protegida sem sessão (ou endereço desconhecido) cai aqui:
// manda para o login, ou para o início quando há sessão.
export default function NotFound() {
  const { user } = useAuth();
  return <Redirect href={user ? '/' : '/entrar'} />;
}
