import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { registerSW } from "virtual:pwa-register";

const clearStaleCaches = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  } catch (error) {
    console.warn("تعذر تنظيف الكاش القديم:", error);
  }
};

clearStaleCaches();

// تفعيل التسجيل التلقائي مع تنظيف النسخ القديمة
const updateSW = registerSW({
  immediate: true,
  skipWaiting: true,
  clientsClaim: true,
  onNeedRefresh() {
    if (
      window.confirm("تم العثور على تحديث جديد للتطبيق. هل تريد التحديث الآن؟")
    ) {
      updateSW(true);
    }
  },
  onOfflineReady() {},
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
