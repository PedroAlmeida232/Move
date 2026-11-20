import { useEffect, useEffectEvent, useState } from 'react';

export type ResourceState<T> =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

/** Carrega um dado da API com os estados carregando, erro (com nova tentativa) e pronto. */
export function useResource<T>(load: () => Promise<T>) {
  const [state, setState] = useState<ResourceState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const run = useEffectEvent(load);

  useEffect(() => {
    let active = true;
    run().then(
      (data) => active && setState({ status: 'ready', data }),
      () => active && setState({ status: 'error' }),
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  // O estado já começa como "carregando"; só a nova tentativa precisa voltar a ele.
  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  };

  /** Atualiza o dado já carregado (ex.: depois de salvar algo novo). */
  const update = (change: (data: T) => T) =>
    setState((current) =>
      current.status === 'ready'
        ? { status: 'ready', data: change(current.data) }
        : current,
    );

  return { state, retry, update };
}
