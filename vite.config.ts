import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Served at the ROOT of the custom domain curadoma.de (GitHub Pages + a
// CNAME file in public/), so the base path is '/' for dev and prod alike.
// (It was '/Curadoma/' while the site lived at the
// chaos20140.github.io/Curadoma/ project URL.)
export default defineConfig(({ isSsrBuild }) => ({
  base: '/',
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // three.js (nur der dekorative Hintergrund) ist der einzige grosse Chunk und
    // wird bewusst erst im Leerlauf nachgeladen -> die Warnschwelle anheben,
    // damit der Build nicht faelschlich warnt.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Framework getrennt vom App-Code buendeln: React/Router aendern sich
        // selten, bleiben so ueber Deploys hinweg im Browser-Cache, waehrend
        // der App-Chunk neu geladen wird.
        // NUR im Client-Build: im SSR-Build sind react/react-dom extern,
        // dort wuerde manualChunks den Build abbrechen.
        manualChunks: isSsrBuild
          ? undefined
          : { 'react-vendor': ['react', 'react-dom', 'react-router'] },
      },
    },
  },
}))
