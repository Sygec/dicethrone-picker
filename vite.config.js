import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
export default defineConfig({
    plugins:[injectHTML()],
// Dedicated ports (Vite's defaults + 100) so this app never lands on a port another local
// project is already serving. strictPort makes a clash fail loudly instead of silently
// drifting to the next free port and leaving you looking at someone else's app.
    server: {
        port: process.env.PORT ? Number(process.env.PORT) : 5273,
        strictPort: true,
// Listen on every interface, not just loopback, so the dev server can be opened from another
// device on the LAN (e.g. a phone at http://192.168.1.20:5273). config.js derives the local
// Supabase URL from the page hostname, so that device reaches this machine's stack too.
        host: true,
    },
    preview: {
        port: 4273,
        strictPort: true,
    },
// Force the build output to go to /docs (for GitHub Pages compatibility)
    build:{
    outDir:'docs',
    emptyOutDir:true,
    }
});
