import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exportFileName, exportPayload } from '../../domain/export';
import { getMealHistory } from '../meal/api';
import { getAchievements } from '../progress/api';
import { getWeights } from '../weight/api';
import { getPlan, getWorkouts } from '../workout/api';

/** Busca tudo da pessoa, grava o JSON no cache do app e abre o compartilhamento do sistema. */
export async function exportMyData(email: string | null, today: string) {
  const [plan, workouts, history, weights, achievements] = await Promise.all([
    getPlan(),
    getWorkouts(),
    getMealHistory(),
    getWeights(),
    getAchievements(),
  ]);
  const payload = exportPayload(
    { email, plan, workouts, meals: history.meals, goals: history.goals, weights, achievements },
    new Date().toISOString(),
  );
  const file = new File(Paths.cache, exportFileName(today));
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Meus dados do Move',
  });
}
