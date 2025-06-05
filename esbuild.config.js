const { build } = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

async function runBuild() {
  try {
    await build({
      entryPoints: ['src/index.ts'],
      outdir: 'dist',
      bundle: true,
      minify: true,
      platform: 'node',
      target: ['node16'],
      sourcemap: false,
      format: 'cjs',
      metafile: true,
      plugins: [
        nodeExternalsPlugin(),
      ],
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
      banner: {
        js: '#!/usr/bin/env node',
      },
      logLevel: 'info',
      legalComments: 'inline',
      minifyWhitespace: true,
      minifyIdentifiers: false,
      minifySyntax: true,
    });
    console.log('⚡ Build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

runBuild(); 