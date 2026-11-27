// Arquivo de "Exportar meus dados" (LGPD: acesso e portabilidade). Os campos ficam em
// português para a própria pessoa ler; `formato` sobe se a estrutura mudar.

export type ExportInput<Plan, Workout, Meal, Goals, Weight, Achievement> = {
  email: string | null;
  plan: Plan;
  workouts: Workout[];
  meals: Meal[];
  goals: Goals;
  weights: Weight[];
  achievements: Achievement[];
};

export function exportPayload<P, W, M, G, Wt, A>(
  data: ExportInput<P, W, M, G, Wt, A>,
  exportedAt: string,
) {
  return {
    app: 'Move',
    formato: 1,
    exportadoEm: exportedAt,
    conta: { email: data.email },
    plano: data.plan,
    treinos: data.workouts,
    refeicoes: data.meals,
    metas: data.goals,
    pesos: data.weights,
    conquistas: data.achievements,
  };
}

export function exportFileName(day: string): string {
  return `move-dados-${day}.json`;
}
