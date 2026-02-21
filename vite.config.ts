import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables from the root
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        })
      ],
    root: './', 
    base: '/',
    define: {
      // This prevents "process is not defined" crashes in the browser
      'process.env': env, 
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        // Points directly to your root index.html
        input: './index.html',
      },
    },
    server: {
      port: 3000,
      // Useful for local testing with your server.js
      proxy: {
        '/api': {
          target: env.VITE_API_BASE || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    }
  };
});
