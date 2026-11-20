import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
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
  signInWithCredential: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn() },
  OAuthProvider: jest.fn(),
}));

jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(),
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED' },
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

describe('login com Apple e Google', () => {
  const appleCredential = { name: 'apple-cred' };
  const googleCredential = { name: 'google-cred' };
  const oauthCredential = jest.fn();

  beforeEach(() => {
    (Crypto.randomUUID as jest.Mock).mockReturnValue('nonce-cru');
    (Crypto.digestStringAsync as jest.Mock).mockResolvedValue('nonce-hash');
    oauthCredential.mockReturnValue(appleCredential);
    (OAuthProvider as unknown as jest.Mock).mockImplementation(() => ({
      credential: oauthCredential,
    }));
    (GoogleAuthProvider.credential as jest.Mock).mockReturnValue(
      googleCredential,
    );
  });

  it('Apple: pede nome e e-mail com o nonce em hash e entra com o token e o nonce cru', async () => {
    (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
      identityToken: 'tok-apple',
    });
    const { result } = await renderHook(() => useAuth(), { wrapper });

    let resultado: string | undefined;
    await act(async () => {
      resultado = await result.current.signInWithApple();
    });

    expect(resultado).toBe('ok');
    expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
      'SHA-256',
      'nonce-cru',
    );
    expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith({
      requestedScopes: [0, 1],
      nonce: 'nonce-hash',
    });
    expect(OAuthProvider).toHaveBeenCalledWith('apple.com');
    expect(oauthCredential).toHaveBeenCalledWith({
      idToken: 'tok-apple',
      rawNonce: 'nonce-cru',
    });
    expect(signInWithCredential).toHaveBeenCalledWith(auth, appleCredential);
  });

  it('Apple: cancelar não é erro e não entra', async () => {
    (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue({
      code: 'ERR_REQUEST_CANCELED',
    });
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await expect(result.current.signInWithApple()).resolves.toBe('cancelled');
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('Apple: outros erros seguem para a tela', async () => {
    (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue({
      code: 'ERR_REQUEST_FAILED',
    });
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await expect(result.current.signInWithApple()).rejects.toEqual({
      code: 'ERR_REQUEST_FAILED',
    });
  });

  it('Apple: sem token é erro', async () => {
    (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
      identityToken: null,
    });
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await expect(result.current.signInWithApple()).rejects.toThrow(
      'Sem token da Apple',
    );
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('Google: configura com o web client id e entra com o idToken', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'web-id';
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: 'tok-google' },
    });
    const { result } = await renderHook(() => useAuth(), { wrapper });

    let resultado: string | undefined;
    await act(async () => {
      resultado = await result.current.signInWithGoogle();
    });

    expect(resultado).toBe('ok');
    expect(GoogleSignin.configure).toHaveBeenCalledWith({
      webClientId: 'web-id',
    });
    expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('tok-google');
    expect(signInWithCredential).toHaveBeenCalledWith(auth, googleCredential);
  });

  it('Google: cancelar (resposta ou erro de cancelamento) não é erro', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'cancelled',
      data: null,
    });
    await expect(result.current.signInWithGoogle()).resolves.toBe('cancelled');

    (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
      code: statusCodes.SIGN_IN_CANCELLED,
    });
    await expect(result.current.signInWithGoogle()).resolves.toBe('cancelled');

    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('Google: outros erros e falta de token seguem para a tela', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });

    (GoogleSignin.signIn as jest.Mock).mockRejectedValue({
      code: 'PLAY_SERVICES_NOT_AVAILABLE',
    });
    await expect(result.current.signInWithGoogle()).rejects.toEqual({
      code: 'PLAY_SERVICES_NOT_AVAILABLE',
    });

    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: null },
    });
    await expect(result.current.signInWithGoogle()).rejects.toThrow(
      'Sem token do Google',
    );
  });
});
