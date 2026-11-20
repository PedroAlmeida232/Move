import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

import { AuthProvider, useAuth } from '../src/lib/auth';

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

const auth = { name: 'auth' };
let emitir: (user: { uid: string } | null) => void;
const cancelar = jest.fn();

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => {
  jest.resetAllMocks();
  (getAuth as jest.Mock).mockReturnValue(auth);
  (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
    emitir = callback;
    return cancelar;
  });
});

describe('useAuth', () => {
  it('começa carregando e sem usuário', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('expõe o usuário quando o Firebase informa a sessão', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await act(async () => emitir({ uid: 'u1' }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual({ uid: 'u1' });
  });

  it('para de carregar sem usuário quando não há sessão', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await act(async () => emitir(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('signIn, signUp e signOut chamam o Firebase', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.signIn('a@b.com', 'segredo1'));
    await act(() => result.current.signUp('c@d.com', 'segredo2'));
    await act(() => result.current.signOut());

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'a@b.com',
      'segredo1',
    );
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      'c@d.com',
      'segredo2',
    );
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('resetPassword pede o e-mail de recuperação ao Firebase', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.resetPassword('a@b.com'));

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'a@b.com');
  });

  it('cancela a escuta ao desmontar', async () => {
    const { unmount } = await renderHook(() => useAuth(), { wrapper });

    await unmount();

    expect(cancelar).toHaveBeenCalled();
  });
});

describe('useAuth fora do AuthProvider', () => {
  it('falha com mensagem clara', async () => {
    const erro = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(renderHook(() => useAuth())).rejects.toThrow(
      'useAuth deve ser usado dentro de AuthProvider',
    );

    erro.mockRestore();
  });
});
