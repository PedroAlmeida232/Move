import { deleteAccount } from '../src/features/account/api';
import { apiFetch } from '../src/lib/api';

jest.mock('../src/lib/api', () => ({ apiFetch: jest.fn() }));

const mockFetch = apiFetch as jest.Mock;
const resposta = (status: number) => ({
  ok: status >= 200 && status < 300,
  status,
});

beforeEach(() => jest.resetAllMocks());

describe('deleteAccount', () => {
  it('chama DELETE /api/v1/me', async () => {
    mockFetch.mockResolvedValue(resposta(204));

    await expect(deleteAccount()).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/me', { method: 'DELETE' });
  });

  it('falha quando a API não confirma a exclusão', async () => {
    mockFetch.mockResolvedValue(resposta(500));

    await expect(deleteAccount()).rejects.toThrow(
      'Falha ao excluir a conta (500)',
    );
  });
});
