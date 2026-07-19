import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ingest': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/query': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/documents': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/documents-all': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/grant-access': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/grant-role': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/grant-role-doc': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/grant-access-all': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/init-db': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/contradictions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploaded-files': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/departments': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
