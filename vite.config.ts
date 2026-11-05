import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // Warn early if a chunk creeps past the DESIGN.md §10 budget.
    chunkSizeWarningLimit: 320,
    rollupOptions: {
      output: {
        // Vite 8 / Rolldown. The 3D stack is heavy, so it is split out and
        // loaded per-route, keeping it off the critical path for first paint.
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules\/(three|@react-three)\// },
            { name: 'post', test: /node_modules\/(postprocessing|n8ao)\// },
            { name: 'motion', test: /node_modules\/(framer-motion|motion-dom|motion-utils|gsap|lenis)\// },
            { name: 'vendor', test: /node_modules\/(react|react-dom|react-router|scheduler)\// },
          ],
        },
      },
    },
  },
});
