import { defineConfig } from 'vitest/config';

// The app shell lives in /src (see README "Architecture"), so Vite's root is
// /src and the production bundle is emitted to /dist for Firebase Hosting.
export default defineConfig({
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
