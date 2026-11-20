import { useEffect, useState } from 'react';

import { getPlan, type Plan } from './api';

type PlanState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; plan: Plan };

export function usePlan() {
  const [state, setState] = useState<PlanState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getPlan().then(
      (plan) => active && setState({ status: 'ready', plan }),
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

  return { state, retry };
}
