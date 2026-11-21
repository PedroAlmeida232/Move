import { apiFetch } from '../../lib/api';

/** Apaga a conta e todos os dados do usuário (no banco e no Firebase). */
export async function deleteAccount(): Promise<void> {
  const resposta = await apiFetch('/api/v1/me', { method: 'DELETE' });
  if (!resposta.ok)
    throw new Error(`Falha ao excluir a conta (${resposta.status})`);
}
