import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    assetsInlineLimit: 0,
    // Phaser is ~1,482 kB; Vite exposes one global warning threshold, not a per-chunk limit.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
