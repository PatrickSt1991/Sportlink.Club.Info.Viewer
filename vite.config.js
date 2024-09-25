import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { BASE_URL } from './src/config'; // Import the base URL

export default defineConfig({
  base: BASE_URL,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // This sets @ to the /src folder
    },
  },
});
