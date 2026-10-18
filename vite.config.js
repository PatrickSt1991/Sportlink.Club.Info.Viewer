import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import { readFileSync } from 'fs';
import { fileURLToPath, URL } from 'url';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));
const local = (p) => fileURLToPath(new URL(p, import.meta.url));

/**
 * Samsung TV packaging: adds the remote-control cursor script, the widget
 * config.xml (with the package.json version) and the app icon to the build output.
 */
function tizenPlugin() {
  return {
    name: 'tizen-package',
    transformIndexHtml(html) {
      return html.replace('</body>', '<script src="./tizen-cursor.js"></script></body>');
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'tizen-cursor.js', source: readFileSync(local('./tizen/tizen-cursor.js')) });
      this.emitFile({
        type: 'asset',
        fileName: 'config.xml',
        source: readFileSync(local('./tizen/config.xml'), 'utf8').replace('__VERSION__', pkg.version),
      });
      this.emitFile({ type: 'asset', fileName: 'logo.png', source: readFileSync(local('./src/assets/logo.png')) });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isTizen = mode === 'tizen';

  return {
    base: './',
    plugins: [
      vue(),
      legacy(
        isTizen
          ? {
              // Tizen 5.x ships Chromium 56
              targets: ['Chrome >= 56', 'Safari >= 10', 'Android >= 5'],
              additionalLegacyPolyfills: ['regenerator-runtime/runtime', 'whatwg-fetch'],
            }
          : {
              targets: ['defaults', 'not IE 11'],
              additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
            }
      ),
      isTizen && tizenPlugin(),
    ].filter(Boolean),
    build: {
      outDir: isTizen ? 'dist-tizen' : 'dist',
      assetsDir: 'assets',
      rollupOptions: isTizen ? { output: { manualChunks: undefined } } : undefined,
    },
    resolve: {
      alias: {
        '@': local('./src'),
      },
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.js'],
      setupFiles: ['tests/setup.js'],
    },
  };
});
