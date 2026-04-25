import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'admin': [
            './src/admin/pages/Login.jsx',
            './src/admin/pages/Register.jsx',
            './src/admin/pages/Dashboard.jsx',
            './src/admin/pages/Transactions.jsx',
            './src/admin/pages/Subscriptions.jsx',
            './src/admin/pages/Donors.jsx',
            './src/admin/pages/Analytics.jsx',
            './src/admin/pages/UtmStats.jsx',
            './src/admin/pages/Settings.jsx',
            './src/admin/pages/Receipts.jsx',
            './src/admin/pages/Campaigns.jsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
