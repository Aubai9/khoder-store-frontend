// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // تحديث التطبيق تلقائياً عند الزبون لو نزلنا تحديث جديد
      devOptions: {
        enabled: false, // تفعيل الميزة حتى أثناء البرمجة (Localhost) للتجربة
      },
      manifest: {
        name: "متجر خضر الإلكتروني", // الاسم الكامل للتطبيق
        short_name: "متجر خضر", // الاسم القصير الذي سيظهر تحت الأيقونة بشاشة الموبايل
        description: "أفضل تجربة تسوق إلكتروني بأسرع وأسهل طريقة",
        theme_color: "#001f3f", // لون شريط الموبايل العلوي (كحلي فخم)
        background_color: "#ffffff", // لون شاشة التحميل (Splash Screen)
        display: "standalone", // هذه الكلمة هي السحر! تجعل التطبيق يفتح بدون شريط المتصفح كأنه تطبيق أصلي
        orientation: "portrait", // تثبيت التطبيق بالطول
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // ليتوافق مع جميع أشكال أيقونات الأندرويد والآيفون
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        importScripts: ["/custom-sw.js"],
      },
    }),
  ],
});
