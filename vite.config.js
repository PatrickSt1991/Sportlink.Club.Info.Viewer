import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import babel from '@rollup/plugin-babel';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  base: './', // must be './' for Tizen
  plugins: [
    vue(),
    legacy({
      targets: ['> 0.25%', 'last 2 versions', 'ie >= 10'], // stricter targets
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js','.jsx','.ts','.tsx','.vue'],
      exclude: ['node_modules/**', '**/*.css', '**/*.scss', '**/*.sass'], // Exclude CSS and similar
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined, // disables code splitting → important!
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true, // allow full transpile of node_modules
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});