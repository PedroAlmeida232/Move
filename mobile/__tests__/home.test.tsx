import { render, screen } from '@testing-library/react-native';

import Home from '../app/index';

describe('tela inicial', () => {
  it('mostra o título Move', () => {
    render(<Home />);

    expect(screen.getByText('Move')).toBeTruthy();
  });
});
