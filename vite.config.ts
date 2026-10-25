import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.APP_PORT) || 3000;
  // Lokasi backend RoamPlan. Saat development, request /api diteruskan (proxy) ke sini.
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3001';
  const apiProxy = {
    '/api': { target: apiTarget, changeOrigin: true },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: apiProxy,
    },
    preview: { port, proxy: apiProxy },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      testTimeout: 20000,
      hookTimeout: 20000,
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: ['node_modules/**', 'dist/**'],
      coverage: {
        provider: 'v8',
        // lcov.info dibutuhkan SonarQube (sonar.javascript.lcov.reportPaths)
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: 'coverage',
        include: ['src/**'],
        exclude: ['src/**/__tests__/**', 'src/**/*.test.{ts,tsx}', 'src/setupTests.ts', 'src/**/*.d.ts'],
      },
    },
  };
});
