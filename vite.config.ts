import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Permite conexões de fora do container
    port: 5173,        // Define a porta explicitamente
    strictPort: true,  // Não tenta outras portas se 5173 estiver ocupada
  },
  plugins: [vue()],
})
