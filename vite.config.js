import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 🌟 التعديل السحري: إخبار Vite بدمج السيرفيس ووركر الخاص بنا في نسخة الرفع 🌟
      strategies: "injectManifest",
      srcDir: "public",
      filename: "custom-sw.js",

      registerType: "autoUpdate",
      devOptions: { enabled: true },
      manifest: {
        name: "متجر PWA",
        short_name: "المتجر",
        theme_color: "#001f3f",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
