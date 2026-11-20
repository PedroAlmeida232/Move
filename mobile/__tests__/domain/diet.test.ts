import {
  dayTotals,
  goalPct,
  parseAmount,
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
