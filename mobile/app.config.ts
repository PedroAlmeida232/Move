import type { ExpoConfig } from 'expo/config';

// No EAS, os arquivos do Firebase chegam como variáveis de arquivo (nunca no Git).
// Localmente, ficam na pasta mobile/ (estão no .gitignore).
const firebaseIos =
  process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist';
const firebaseAndroid =
  process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';

const config: ExpoConfig = {
  name: 'Move',
  slug: 'move',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
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
  extra: { eas: { projectId: '33aadfd9-8ada-44e7-9efb-ed102eb23f28' } },
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
