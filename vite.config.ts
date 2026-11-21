import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

/**
 * Python for the lessons: the Pyodide runtime, served from this site at /pyodide/ so that no other
 * site is involved. public/runner.html downloads these files the first time a Python exercise is opened.
 */
const PYODIDE_FILES: Record<string, string> = {
  'pyodide.js': 'text/javascript',
  'pyodide.asm.mjs': 'text/javascript',
  'pyodide.asm.wasm': 'application/wasm',
  'python_stdlib.zip': 'application/zip',
  'pyodide-lock.json': 'application/json',
};

function pyodideFiles(): Plugin {
  const folder = dirname(createRequire(import.meta.url).resolve('pyodide/package.json'));
  return {
    name: 'gahz-pyodide',
    // `vite dev`: serve the files straight from node_modules.
    configureServer(server) {
      server.middlewares.use('/pyodide', (request, response, next) => {
        const name = (request.url ?? '').split('?')[0]?.slice(1) ?? '';
        const type = PYODIDE_FILES[name];
        if (!type) return next();
        response.setHeader('Content-Type', type);
        // The runner page is sandboxed, so to the browser it is another origin.
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.end(readFileSync(join(folder, name)));
      });
    },
    // `vite build`: copy them to dist/pyodide/.
    generateBundle() {
      for (const name of Object.keys(PYODIDE_FILES)) {
        this.emitFile({ type: 'asset', fileName: `pyodide/${name}`, source: readFileSync(join(folder, name)) });
      }
    },
  };
}

// The app shell lives in /src (see README "Architecture"), so Vite's root is
// /src and the production bundle is emitted to /dist for Firebase Hosting.
export default defineConfig({
  plugins: [pyodideFiles()],
  root: 'src',
  envDir: '..',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    // The lazily loaded Firebase SDK chunk (auth + firestore) is about 760 kB before gzip.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      // The legal pages are standalone documents so they can be linked to directly.
      input: ['src/index.html', 'src/privacy.html', 'src/terms.html'],
      output: {
        // Keep the Firebase SDK out of the entry chunk: guests never download it.
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }
          return undefined;
        },
      },
    },
  },
  server: { port: 5173, open: false },
  preview: { port: 4173 },
  test: {
    root: '.',
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
