import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // SSE precisa de rota separada com configuração especial
      '/api/watch': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Sem timeout para SSE (conexão longa)
        timeout: 0,
        proxyTimeout: 0,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            // Marca a requisição como SSE para não ser bufferizada
            req.headers['accept'] = 'text/event-stream'
            req.headers['cache-control'] = 'no-cache'
          })
          proxy.on('error', (err) => {
            console.error('[proxy /api/watch] erro:', err.message)
          })
        },
      },
      // API geral
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Arquivos estáticos servidos pelo Express
      '/files': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})
