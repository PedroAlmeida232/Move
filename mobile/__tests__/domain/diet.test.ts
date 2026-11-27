import {
  dayTotals,
  goalPct,
  parseAmount,
  recentMeals,
  validateMeal,
} from '../../src/domain/diet';

describe('parseAmount', () => {
  it('lê números com vírgula ou ponto', () => {
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount(' 30 ')).toBe(30);
    expect(parseAmount('0')).toBe(0);
  });

  it('devolve null para vazio, texto ou negativo', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('-1')).toBeNull();
  });
});

describe('validateMeal', () => {
  const ok = {
    name: 'Almoço',
    kcal: '650',
    protein: '42',
    carbs: '',
    fat: '18,5',
  };

  it('aceita uma refeição válida e trata macros vazios como 0', () => {
    expect(validateMeal(ok)).toEqual({
      errors: {},
      meal: { name: 'Almoço', kcal: 650, protein: 42, carbs: 0, fat: 18.5 },
    });
  });

  it('exige nome', () => {
    expect(validateMeal({ ...ok, name: '   ' }).errors).toEqual({
      name: 'Informe o nome da refeição.',
    });
  });

  it.each(['', '0', '-10', 'abc'])(
    'exige calorias positivas (recusa "%s")',
    (kcal) => {
      const { errors, meal } = validateMeal({ ...ok, kcal });
      expect(errors).toEqual({
        kcal: 'Informe as calorias (número maior que zero).',
      });
      expect(meal).toBeNull();
    },
  );

  it.each(['protein', 'carbs', 'fat'] as const)(
    'recusa %s negativo ou não numérico',
    (campo) => {
      expect(validateMeal({ ...ok, [campo]: '-3' }).errors).toEqual({
        [campo]: 'Use um número positivo.',
      });
      expect(validateMeal({ ...ok, [campo]: 'x' }).errors).toEqual({
        [campo]: 'Use um número positivo.',
      });
    },
  );

  it('junta todos os erros de uma vez', () => {
    const { errors } = validateMeal({
      name: '',
      kcal: '',
      protein: '-1',
      carbs: 'a',
      fat: '',
    });
    expect(Object.keys(errors)).toEqual(['name', 'kcal', 'protein', 'carbs']);
  });
});

describe('dayTotals', () => {
  it('soma as refeições do dia', () => {
    expect(
      dayTotals([
        { kcal: 500, protein: 30, carbs: 50, fat: 10 },
        { kcal: 250.5, protein: 12.5, carbs: 0, fat: 5 },
      ]),
    ).toEqual({ kcal: 750.5, protein: 42.5, carbs: 50, fat: 15 });
  });

  it('dia vazio é zero', () => {
    expect(dayTotals([])).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('goalPct', () => {
  it('é a porcentagem arredondada da meta, limitada a 100', () => {
    expect(goalPct(500, 2000)).toBe(25);
    expect(goalPct(1, 3)).toBe(33);
    expect(goalPct(2500, 2000)).toBe(100);
  });

  it('sem meta é 0', () => {
    expect(goalPct(500, 0)).toBe(0);
  });
});

describe('recentMeals', () => {
  const meal = (date: string, name: string, kcal = 100) => ({
    id: `${date}-${name}`,
    date,
    name,
    kcal,
    protein: 10,
    carbs: 5,
    fat: 2,
  });

  it('mais recentes primeiro, só com os valores da refeição', () => {
    expect(
      recentMeals([meal('2026-11-20', 'Almoço'), meal('2026-11-22', 'Jantar', 600)]),
    ).toEqual([
      { name: 'Jantar', kcal: 600, protein: 10, carbs: 5, fat: 2 },
      { name: 'Almoço', kcal: 100, protein: 10, carbs: 5, fat: 2 },
    ]);
  });

  it('repetidas pelo nome (maiúsculas e espaços não importam) ficam só com a mais recente', () => {
    const lista = recentMeals([
      meal('2026-11-20', 'Pão com ovo', 300),
      meal('2026-11-21', '  pão  COM ovo ', 350),
      meal('2026-11-19', 'Pão com ovo', 280),
    ]);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ name: 'pão  COM ovo', kcal: 350 });
  });

  it('no mesmo dia, vale a registrada por último', () => {
    const lista = recentMeals([
      meal('2026-11-21', 'Lanche', 200),
      meal('2026-11-21', 'lanche', 250),
    ]);
    expect(lista).toEqual([
      { name: 'lanche', kcal: 250, protein: 10, carbs: 5, fat: 2 },
    ]);
  });

  it('refeições diferentes no mesmo dia: a registrada por último vem antes', () => {
    const lista = recentMeals([
      meal('2026-11-21', 'Café'),
      meal('2026-11-21', 'Almoço'),
    ]);
    expect(lista.map((m) => m.name)).toEqual(['Almoço', 'Café']);
  });

  it('limita a 8 por padrão, ou ao limite pedido', () => {
    const muitas = Array.from({ length: 12 }, (_, i) =>
      meal(`2026-11-${String(10 + i).padStart(2, '0')}`, `R${i}`),
    );
    expect(recentMeals(muitas)).toHaveLength(8);
    expect(recentMeals(muitas)[0].name).toBe('R11');
    expect(recentMeals(muitas, 3)).toHaveLength(3);
  });

  it('sem histórico, lista vazia', () => {
    expect(recentMeals([])).toEqual([]);
  });
});
