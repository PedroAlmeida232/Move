import fs from 'fs';
import path from 'path';

// Telas, features e componentes base só podem usar os tokens de src/lib/theme.ts: nada de
// fontSize nem cor hexadecimal solta.
const ROOT = path.join(__dirname, '..');
const DIRS = ['app', 'src/features', 'src/lib/ui'];
const ALLOWED = new Set(['src/lib/theme.ts']);
const LOOSE = /fontSize|#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b/;

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
  it('nenhum arquivo tem fontSize ou cor hexadecimal solta, sem exceções', () => {
    expect(comValoresSoltos).toEqual([]);
  });
});
