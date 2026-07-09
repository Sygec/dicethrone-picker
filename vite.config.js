import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
export default defineConfig({
    plugins:[injectHTML()],
    server: {
        port: process.env.PORT ? Number(process.env.PORT) : 5173,
        strictPort: !!process.env.PORT,
    },
// Force the build output to go to /docs (for GitHub Pages compatibility)
    build:{
    outDir:'docs',
    emptyOutDir:true,
    }
});
