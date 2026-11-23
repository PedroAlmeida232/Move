import { renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import Catalogo from '../app/catalogo';

const inicio = () => <Text>Início</Text>;
const g = globalThis as unknown as { __DEV__: boolean };

afterEach(() => {
  g.__DEV__ = true;
});

describe('catálogo de componentes', () => {
  it('em desenvolvimento mostra os componentes', async () => {
    await renderRouter(
      { index: inicio, catalogo: Catalogo },
      { initialUrl: '/catalogo' },
    );
    expect(screen.getByRole('header', { name: 'Catálogo' })).toBeOnTheScreen();
    for (const nome of [
      'Card e ListRow',
      'Button',
      'ProgressRing',
      'ProgressBar',
      'StatTile',
      'EmptyState',
      'ErrorState',
      'Skeleton',
    ]) {
      expect(screen.getByRole('header', { name: nome })).toBeOnTheScreen();
    }
  });

  it('fora de desenvolvimento volta para o início', async () => {
    g.__DEV__ = false;
    await renderRouter(
      { index: inicio, catalogo: Catalogo },
      { initialUrl: '/catalogo' },
    );
    expect(await screen.findByText('Início')).toBeOnTheScreen();
    expect(screen.queryByText('Catálogo')).toBeNull();
  });
});
