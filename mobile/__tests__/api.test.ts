import { getAuth, signOut } from '@react-native-firebase/auth';

import { apiFetch } from '../src/lib/api';

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}));

const getIdToken = jest.fn();
const fetchMock = jest.fn();

function resposta(status: number) {
  return { status, ok: status >= 200 && status < 300 } as Response;
}

beforeEach(() => {
  jest.resetAllMocks();
  process.env.EXPO_PUBLIC_API_URL = 'https://api.exemplo.com';
  globalThis.fetch = fetchMock;
  (getAuth as jest.Mock).mockReturnValue({ currentUser: { getIdToken } });
  getIdToken.mockResolvedValue('token-1');
});

describe('apiFetch', () => {
  it('envia Authorization: Bearer <token> para a URL da API', async () => {
    fetchMock.mockResolvedValue(resposta(200));

    await apiFetch('/api/v1/me');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.exemplo.com/api/v1/me');
    expect(new Headers(init.headers).get('Authorization')).toBe(
      'Bearer token-1',
    );
  });

  it('mantém método e corpo informados', async () => {
    fetchMock.mockResolvedValue(resposta(201));

    await apiFetch('/api/v1/workouts', { method: 'POST', body: '{}' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{}');
  });

  it('em 401 renova o token uma vez e repete o pedido', async () => {
    fetchMock
      .mockResolvedValueOnce(resposta(401))
      .mockResolvedValueOnce(resposta(200));
    getIdToken
      .mockResolvedValueOnce('token-1')
      .mockResolvedValueOnce('token-2');

    const res = await apiFetch('/api/v1/me');

    expect(res.status).toBe(200);
    expect(getIdToken).toHaveBeenNthCalledWith(2, true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, init] = fetchMock.mock.calls[1];
    expect(new Headers(init.headers).get('Authorization')).toBe(
      'Bearer token-2',
    );
    expect(signOut).not.toHaveBeenCalled();
  });

  it('se o 401 persistir após renovar, desloga e falha', async () => {
    fetchMock.mockResolvedValue(resposta(401));

    await expect(apiFetch('/api/v1/me')).rejects.toThrow('Sessão expirada');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('sem usuário logado falha sem chamar a API', async () => {
    (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

    await expect(apiFetch('/api/v1/me')).rejects.toThrow('Sem sessão');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
