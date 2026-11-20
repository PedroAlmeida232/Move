import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** `cancelled` quando a pessoa fecha a janela da Apple ou do Google (não é erro). */
  signInWithApple: () => Promise<SocialResult>;
  signInWithGoogle: () => Promise<SocialResult>;
};

export type SocialResult = 'ok' | 'cancelled';

const code = (error: unknown) => (error as { code?: unknown } | null)?.code;

async function signInWithApple(): Promise<SocialResult> {
  // A Apple recebe o nonce em hash; o Firebase confere com o nonce cru.
  const rawNonce = Crypto.randomUUID();
  const nonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  let apple: AppleAuthentication.AppleAuthenticationCredential;
  try {
    apple = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce,
    });
  } catch (error) {
    if (code(error) === 'ERR_REQUEST_CANCELED') return 'cancelled';
    throw error;
  }
  if (!apple.identityToken) throw new Error('Sem token da Apple');

  const credential = new OAuthProvider('apple.com').credential({
    idToken: apple.identityToken,
    rawNonce,
  });
  await signInWithCredential(getAuth(), credential);
  return 'ok';
}

async function signInWithGoogle(): Promise<SocialResult> {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
  let response: Awaited<ReturnType<typeof GoogleSignin.signIn>>;
  try {
    await GoogleSignin.hasPlayServices();
    response = await GoogleSignin.signIn();
  } catch (error) {
    if (code(error) === statusCodes.SIGN_IN_CANCELLED) return 'cancelled';
    throw error;
  }
  if (response.type === 'cancelled') return 'cancelled';
  if (!response.data.idToken) throw new Error('Sem token do Google');

  await signInWithCredential(
    getAuth(),
    GoogleAuthProvider.credential(response.data.idToken),
  );
  return 'ok';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(getAuth(), (current) => {
        setUser(current);
        setLoading(false);
      }),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(getAuth(), email, password);
      },
      signUp: async (email, password) => {
        await createUserWithEmailAndPassword(getAuth(), email, password);
      },
      signOut: () => firebaseSignOut(getAuth()),
      resetPassword: (email) => sendPasswordResetEmail(getAuth(), email),
      signInWithApple,
      signInWithGoogle,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return value;
}
