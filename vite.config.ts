import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const apiProxy = {
  '/api-proxy': {
    target: 'https://open-api.delcom.org',
    changeOrigin: true,
    rewrite: (pathStr: string) => pathStr.replace(/^\/api-proxy/, '/api/v1'),
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.APP_PORT) || 3000;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port,
      host: '0.0.0.0',
      proxy: apiProxy,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: { port, proxy: apiProxy },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || '/api-proxy'
      ),
    },
  };
});
