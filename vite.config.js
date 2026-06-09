import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Multi-entry: the marketing site (index.html) and the standalone
// deck builder tool (deck.html) build independently and never interfere.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        deck: resolve(__dirname, 'deck.html'),
      },
    },
  },
})
