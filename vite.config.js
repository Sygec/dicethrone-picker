import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
export default defineConfig({
    plugins:[injectHTML()],
// Force the build output to go to /docs (for GitHub Pages compatibility)
    build:{
    outDir:'docs',
    emptyOutDir:true,
    }
});
