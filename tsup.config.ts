import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    main: 'electron/main.ts',
    preload: 'electron/preload.ts'
  },
  outDir: 'dist-electron',
  platform: 'node',
  target: 'node20',
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: false,
  external: ['electron'],
  define: {
    __ENABLE_AUTO_UPDATES__: JSON.stringify(process.env.ENABLE_AUTO_UPDATES === '1')
  }
});
