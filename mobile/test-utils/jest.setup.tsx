// Os ícones carregam uma fonte nativa que não existe no Jest. Viram um texto com
// o nome, escondido do leitor de tela como no app, para o teste ver qual foi desenhado.
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = jest.requireActual('react-native');
  function Ionicons({ name }: { name: string }) {
    return <Text testID={`icone-${name}`}>{name}</Text>;
  }
  return Ionicons;
});
