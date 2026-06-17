import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return undefined;
          const packagePath = id.split('/node_modules/').pop() ?? id;

          if (
            packagePath === 'react' ||
            packagePath.startsWith('react/') ||
            packagePath.startsWith('react-dom/')
          ) {
            return 'react';
          }
          if (
            packagePath.startsWith('@apollo/client/') ||
            packagePath.startsWith('@tanstack/react-query/') ||
            packagePath.startsWith('graphql/')
          ) {
            return 'data';
          }
          if (
            packagePath.startsWith('react-markdown/') ||
            packagePath.startsWith('rehype-') ||
            packagePath.startsWith('remark-')
          ) {
            return 'markdown';
          }
          if (
            packagePath.startsWith('lucide-react/') ||
            packagePath.startsWith('motion/') ||
            packagePath.startsWith('yet-another-react-lightbox/')
          ) {
            return 'ui';
          }

          return undefined;
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
