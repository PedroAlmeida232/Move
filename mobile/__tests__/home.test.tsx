import { render, screen } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';

import Home from '../app/index';
import { themes } from '../src/lib/theme';

jest.mock('react-native/Libraries/Utilities/useColorScheme');

const mockScheme = useColorScheme as jest.Mock;

describe('tela inicial', () => {
  beforeEach(() => mockScheme.mockReturnValue('light'));

  it('mostra o título Move', async () => {
    await render(<Home />);

    expect(screen.getByText('Move')).toBeTruthy();
  });

  it.each(['light', 'dark'] as const)(
    'usa as cores do tema %s',
    async (scheme) => {
      mockScheme.mockReturnValue(scheme);
      await render(<Home />);

      expect(screen.getByText('Move')).toHaveStyle({
        color: themes[scheme].ink,
      });
    },
  );
});
