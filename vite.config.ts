/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base "./" permite publicar en cualquier subcarpeta (GitHub Pages, Netlify, etc.)
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Norak del Valle Gris",
        short_name: "Norak",
        description: "Hoja de personaje y grimorio de mago, D&D 2024",
        lang: "es",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "any",
        background_color: "#1d1510",
        theme_color: "#1d1510",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // la app y las fuentes (empaquetadas con @fontsource) quedan en caché para jugar sin conexión
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: "node",
    setupFiles: ["src/test-setup.ts"],
  },
});
