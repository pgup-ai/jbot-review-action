import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('action.yml', root), 'utf8');
const image = "image: 'docker://ghcr.io/pgup-ai/jbot-review:latest'";
if (source.split(image).length !== 2) {
  throw new Error('Expected exactly one full-image reference in root action.yml.');
}
for (const variant of ['slim', 'opencode']) {
  const generated = source.replace(image, `image: 'docker://ghcr.io/pgup-ai/jbot-review:latest-${variant}'`);
  const target = new URL(`${variant}/action.yml`, root);
  if (process.argv.includes('--check')) {
    if (readFileSync(target, 'utf8') !== generated) {
      throw new Error(`${variant}/action.yml is stale; run node scripts/sync-variants.mjs.`);
    }
  } else {
    mkdirSync(new URL(`${variant}/`, root), { recursive: true });
    writeFileSync(target, generated);
  }
}
