  
import path from 'path';
import react from '@vitejs/plugin-react';
import Terminal from 'vite-plugin-terminal'


const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public');
const BUILD_DIR = path.resolve(__dirname, './www',);
export default async () => {

  return  {
    plugins: [
      react(),
      Terminal()

    ],
    root: SRC_DIR,
    base: '',
    publicDir: PUBLIC_DIR,
    build: {
      outDir: BUILD_DIR,
      assetsInlineLimit: 0,
      emptyOutDir: true,
      rollupOptions: {
        treeshake: false,
      },
    },
    resolve: {
      alias: {
        '@': SRC_DIR,
      },
    },
    server: {
      host: true,
      allowedHosts: [
        '5173-ruskcoder-gradexis-app-em4szju5qc.app.codeanywhere.com'
      ]
    },

  };
}
