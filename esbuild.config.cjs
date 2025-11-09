#!/usr/bin/env node

const esbuild = require('esbuild');
const { readFileSync } = require('fs');
const { dirname, join } = require('path');

const currentDir = dirname(require.main.filename || process.argv[1]);
const packageJson = JSON.parse(readFileSync(join(currentDir, 'package.json'), 'utf8'));

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  format: 'esm',
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: [
    'readline',
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ],
  minify: false, // Disable minification to avoid shebang issues
  sourcemap: isWatch,
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
  },
};

if (isWatch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).then(() => {
    console.log('Build complete');
  });
}