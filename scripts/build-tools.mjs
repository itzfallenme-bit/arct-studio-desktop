import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const toolsDir = path.join(root, 'tools');
const publicTools = path.join(root, 'public', 'tools');
const sharedDir = path.join(toolsDir, '_shared');
const built = [];
const failed = [];
const requested = process.argv.slice(2);
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

if (!fs.existsSync(path.join(root, 'dev', 'puter-localhost.mjs'))) {
  fs.mkdirSync(path.join(root, 'dev'), { recursive: true });
  fs.copyFileSync(
    path.join(root, 'ref', 'everything', 'dev', 'puter-localhost.mjs'),
    path.join(root, 'dev', 'puter-localhost.mjs'),
  );
}

fs.mkdirSync(publicTools, { recursive: true });
fs.cpSync(sharedDir, path.join(publicTools, '_shared'), { recursive: true });

const tools = fs
  .readdirSync(toolsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== '_shared')
  .map((entry) => entry.name)
  .filter((slug) => fs.existsSync(path.join(toolsDir, slug, 'package.json')))
  .filter((slug) => !excluded.has(slug))
  .filter((slug) => requested.length === 0 || requested.includes(slug));

for (const slug of tools) {
  const cwd = path.join(toolsDir, slug);
  const output = path.join(cwd, 'dist');
  const target = path.join(publicTools, slug);
  console.log(`\n=== ${slug}`);

  if (fs.existsSync(path.join(target, 'index.html'))) {
    built.push(slug);
    console.log(`ALREADY BUILT ${slug}`);
    continue;
  }

  try {
    if (fs.existsSync(path.join(cwd, 'node_modules'))) {
      fs.rmSync(path.join(cwd, 'node_modules'), {
        recursive: true,
        force: true,
      });
    }
    execSync('npm install --no-audit --no-fund', {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: '1',
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1',
        PUPPETEER_SKIP_DOWNLOAD: '1',
      },
    });

    let builtOk = false;
    try {
      execSync('npm run build -- --base=./', {
        cwd,
        stdio: 'inherit',
        env: process.env,
      });
      builtOk = true;
    } catch {
      console.warn(
        `Build script failed for ${slug}; retrying with Vite directly.`,
      );
    }

    if (!builtOk) {
      execSync('npx vite build --base=./', {
        cwd,
        stdio: 'inherit',
        env: process.env,
      });
    }

    if (!fs.existsSync(path.join(output, 'index.html'))) {
      throw new Error('No dist/index.html was produced.');
    }

    const htmlPath = path.join(output, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    if (!html.includes('puter-local.js')) {
      html = html.replace(
        /<\/body>/i,
        '  <script src="../_shared/puter-local.js"></script>\n</body>',
      );
    }
    if (!html.includes('google-ai.js')) {
      html = html.replace(
        /<\/body>/i,
        '  <script src="../_shared/google-ai.js"></script>\n</body>',
      );
    }
    fs.writeFileSync(htmlPath, html);

    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(output, target, { recursive: true });
    built.push(slug);
    console.log(`COPIED ${slug}`);
  } catch (error) {
    failed.push(slug);
    console.error(`FAILED ${slug}: ${error.message}`);
  } finally {
    fs.rmSync(path.join(cwd, 'node_modules'), { recursive: true, force: true });
    fs.rmSync(output, { recursive: true, force: true });
    fs.rmSync(path.join(cwd, 'package-lock.json'), { force: true });
  }
}

const manifest = {
  built: built.sort(),
  failed: failed.sort(),
  generatedAt: new Date().toISOString(),
};
if (process.env.BUILD_MANIFEST) {
  fs.writeFileSync(
    process.env.BUILD_MANIFEST,
    JSON.stringify(manifest, null, 2),
  );
} else {
  fs.writeFileSync(
    path.join(publicTools, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  fs.writeFileSync(
    path.join(root, 'src', 'data', 'builtTools.ts'),
    `export const BUILT_TOOLS = new Set<string>([\n${built
      .sort()
      .map((slug) => `  '${slug}',`)
      .join('\n')}\n]);\n`,
  );
}

console.log(`\nBUILT ${built.length}: ${built.join(', ')}`);
console.log(`FAILED ${failed.length}: ${failed.join(', ')}`);
