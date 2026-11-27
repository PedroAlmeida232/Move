// Os ícones carregam uma fonte nativa que não existe no Jest. Viram um texto com
// o nome, escondido do leitor de tela como no app, para o teste ver qual foi desenhado.
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = jest.requireActual('react-native');
  function Ionicons({ name }: { name: string }) {
    return <Text testID={`icone-${name}`}>{name}</Text>;
  }
  return Ionicons;
});

// Módulos nativos do login: no Jest não existem. Os testes de login trocam por mocks próprios.
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {},
  statusCodes: {},
}));
jest.mock('expo-apple-authentication', () => ({}));
jest.mock('expo-crypto', () => ({}));
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

// Notificações locais: no Jest não há agendador. Os testes de lembretes trocam por mocks próprios.
jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { WEEKLY: 'weekly' },
}));
