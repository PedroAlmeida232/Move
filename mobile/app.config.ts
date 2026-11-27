import type { ExpoConfig } from 'expo/config';

// No EAS, os arquivos do Firebase chegam como variáveis de arquivo (nunca no Git).
// Localmente, ficam na pasta mobile/ (estão no .gitignore).
const firebaseIos =
  process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist';
const firebaseAndroid =
  process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';

const PROJECT_ID = '33aadfd9-8ada-44e7-9efb-ed102eb23f28';

const config: ExpoConfig = {
  name: 'Move',
  slug: 'move',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  // Atualizações da parte JavaScript pelo EAS Update, sem nova revisão da Apple.
  // O runtime segue a versão: mudou código nativo ou plugin, suba a versão e gere um build novo.
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: `https://u.expo.dev/${PROJECT_ID}`,
    checkAutomatically: 'ON_LOAD',
    // Se o download demorar, abre com o que já tem e usa a novidade na próxima abertura.
    fallbackToCacheTimeout: 0,
  },
  scheme: 'move',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'br.app.movetreino',
    usesAppleSignIn: true,
    googleServicesFile: firebaseIos,
    infoPlist: {
      CFBundleDevelopmentRegion: 'pt-BR',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'br.app.movetreino',
    googleServicesFile: firebaseAndroid,
    adaptiveIcon: {
      backgroundColor: '#2563EB',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: { eas: { projectId: PROJECT_ID } },
  plugins: [
    'expo-router',
    'expo-apple-authentication',
    '@react-native-google-signin/google-signin',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    ['expo-build-properties', { ios: { useFrameworks: 'dynamic' } }],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        backgroundColor: '#FFFFFF',
        dark: { backgroundColor: '#000000' },
      },
    ],
  ],
};

export default config;
