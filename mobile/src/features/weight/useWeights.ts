import { rangeStart, sortByDate, type WeightRange } from '../../domain/weight';
import { useResource } from '../../lib/useResource';

import { getWeights } from './api';

/** Pesos do período até `today`, ordenados por data. Ao trocar o período, chame `refresh`. */
export function useWeights(today: string, range: WeightRange = '90d') {
  return useResource(async () => {
    const from = rangeStart(today, range);
    return sortByDate(await (from ? getWeights(from, today) : getWeights()));
  });
}
