/**
 * Reproduces the GitHub Pages preview build locally.
 *
 *   npm run build:preview            # assumes the repo is served at /Hermanka/
 *   npm run build:preview -- /Other  # or say which subdirectory
 *
 * Exists because the preview path is otherwise only ever exercised in CI, and
 * "it 404s on the client's link" is a bad way to discover that a component
 * picked up a new absolute URL. This runs the same two env vars the workflow
 * sets, then the same guard the workflow runs.
 *
 * npm scripts cannot set an environment variable portably   `FOO=x astro build`
 * is not valid on Windows   which is the whole reason this is a file and not a
 * one-liner in package.json.
 *
 * ⚠ It writes to dist/, so the last build wins. Run a plain `npm run build`
 * afterwards before testing anything about production.
 */
import { spawnSync } from 'node:child_process';

const basePath = process.argv[2] || '/Hermanka';
const siteUrl = process.env.SITE_URL || 'https://adrianjonathanedwards.github.io';

const env = { ...process.env, BASE_PATH: basePath, SITE_URL: siteUrl };

console.log(`preview build: ${siteUrl}${basePath}/\n`);

const build = spawnSync('npx', ['astro', 'build'], {
  env,
  stdio: 'inherit',
  shell: true,
});
if (build.status !== 0) process.exit(build.status ?? 1);

const check = spawnSync('node', ['tools/check-base.mjs'], {
  env,
  stdio: 'inherit',
  shell: true,
});
if (check.status !== 0) process.exit(check.status ?? 1);

console.log(`\nServe it the way GitHub Pages will   dist/ must sit at ${basePath}/, not at the root.`);
