// Catálogo do protótipo. O backend (B11) só guarda o código e quando foi desbloqueada.
export const ACHIEVEMENTS = [
  {
    code: 'first',
    name: 'Primeiro treino',
    description: 'Conclua um treino completo',
  },
  {
    code: 'streak7',
    name: '7 dias seguidos',
    description: 'Mantenha a sequência por 7 dias',
  },
  {
    code: 'ten',
    name: '10 treinos',
    description: 'Conclua 10 treinos completos',
  },
  {
    code: 'pr',
    name: 'Novo recorde',
    description: 'Supere sua carga em um exercício',
  },
  {
    code: 'w4',
    name: 'Balança em dia',
    description: 'Registre o peso 4 semanas seguidas',
  },
  {
    code: 'prot5',
    name: 'Proteína em dia',
    description: 'Bata a meta de proteína em 5 dias',
  },
  {
    code: 'sets100',
    name: '100 séries',
    description: 'Conclua 100 séries no total',
  },
  {
    code: 'w25',
    name: '25 treinos',
    description: 'Conclua 25 treinos completos',
  },
] as const;
