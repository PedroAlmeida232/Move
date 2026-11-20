import { useResource } from '../../lib/useResource';

import { getPlan } from './api';

export function usePlan() {
  return useResource(getPlan);
}
