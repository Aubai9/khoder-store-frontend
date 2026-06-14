// public/custom-sw.js

// 1. الاستماع للإشعارات القادمة من السيرفر (والتطبيق مغلق)
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "إشعار جديد";
  const options = {
    body: data.body || "يوجد تحديث جديد في المتجر.",
    icon: "/icon-192.png", // أيقونة متجرك
    badge: "/icon-192.png", // أيقونة شريط الإشعارات العلوية بالموبايل
    vibrate: [200, 100, 200], // رنة اهتزاز مميزة للهاتف
    data: {
      url: data.url || "/", // الرابط الذي سيفتح عند الضغط على الإشعار
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. ماذا يحدث عندما يضغط المدير على الإشعار من شاشة الموبايل؟
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // إغلاق الإشعار

  // فتح التطبيق وتوجيه المدير لصفحة الطلبات فوراً
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// 3. الاستماع لطلبات جلب البيانات (إجباري لكي يعتبره المتصفح تطبيق PWA قابل للتثبيت وعمله بدون إنترنت)
self.addEventListener("fetch", function (event) {
  // وجود هذا المستمع فارغاً يكفي لمتطلبات جوجل لتثبيت التطبيق بنجاح!
});
