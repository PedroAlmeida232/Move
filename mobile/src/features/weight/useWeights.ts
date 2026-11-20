import { addDays } from '../../domain/streak';
import { sortByDate } from '../../domain/weight';
import { useResource } from '../../lib/useResource';

import { getWeights } from './api';

/** Pesos dos últimos 90 dias até `today`, ordenados por data. */
export function useWeights(today: string) {
  return useResource(async () =>
    sortByDate(await getWeights(addDays(today, -89), today)),
  );
}
