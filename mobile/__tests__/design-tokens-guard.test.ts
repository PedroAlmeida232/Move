import fs from 'fs';
import path from 'path';

// Telas, features e componentes base só podem usar os tokens de src/lib/theme.ts: nada de
// fontSize nem cor hexadecimal solta.
const ROOT = path.join(__dirname, '..');
const DIRS = ['app', 'src/features', 'src/lib/ui'];
const ALLOWED = new Set(['src/lib/theme.ts']);
const LOOSE = /fontSize|#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b/;

// Arquivos que ainda têm valores soltos. Esvazie a lista nas tarefas D04 a D10
// conforme cada tela for redesenhada; não adicione arquivos novos aqui.
const PENDENTES = [
  'app/(auth)/criar-conta.tsx',
  'app/(auth)/entrar.tsx',
  'app/(auth)/recuperar-senha.tsx',
  'app/(tabs)/dieta.tsx',
  'app/(tabs)/peso.tsx',
  'app/(tabs)/plano.tsx',
  'app/(tabs)/progresso.tsx',
  'app/ajustes.tsx',
  'src/features/auth/SocialButtons.tsx',
  'src/features/meal/GoalBar.tsx',
  'src/features/progress/LevelUp.tsx',
  'src/features/workout/TodayWorkout.tsx',
];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(rel);
    return /\.(ts|tsx)$/.test(e.name) ? [rel] : [];
  });
}

const comValoresSoltos = DIRS.flatMap(sourceFiles)
  .filter((f) => !ALLOWED.has(f))
  .filter((f) => LOOSE.test(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  .sort();

describe('uso dos tokens de design', () => {
  it('nenhum arquivo novo tem fontSize ou cor hexadecimal solta', () => {
    const novos = comValoresSoltos.filter((f) => !PENDENTES.includes(f));
    expect(novos).toEqual([]);
  });

  it('a lista de pendentes não tem arquivos que já estão limpos', () => {
    const limpos = PENDENTES.filter((f) => !comValoresSoltos.includes(f));
    expect(limpos).toEqual([]);
  });
});
