import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsDir = path.join(root, 'tools');
const publicTools = path.join(root, 'public', 'tools');
const excluded = new Set([
  'email',
  'teamchat',
  'meetings',
  'help-desk',
  'signatures',
  'chess',
  'checkers',
  'backgammon',
  'solitaire',
  'sudoku',
]);

const expected = fs
  .readdirSync(toolsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== '_shared')
  .map((entry) => entry.name)
  .filter((slug) => fs.existsSync(path.join(toolsDir, slug, 'package.json')))
  .filter((slug) => !excluded.has(slug))
  .sort();

const built = expected.filter((slug) =>
  fs.existsSync(path.join(publicTools, slug, 'index.html')),
);
const missing = expected.filter((slug) => !built.includes(slug));

fs.writeFileSync(
  path.join(publicTools, 'manifest.json'),
  JSON.stringify(
    {
      built,
      missing,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(root, 'src', 'data', 'builtTools.ts'),
  `export const BUILT_TOOLS = new Set<string>([\n${built
    .map((slug) => `  '${slug}',`)
    .join('\n')}\n]);\n`,
);

console.log(`BUNDLED ${built.length}/${expected.length}`);
if (missing.length > 0) {
  console.error(`MISSING ${missing.join(', ')}`);
  process.exit(1);
}
