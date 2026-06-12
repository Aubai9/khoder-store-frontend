// src/services/api.js
import axios from "axios";

const API = axios.create({
  // التعديل الذكي: يقرأ رابط الباك إند السحابي تلقائياً عند الرفع
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
// 1. اعتراض الطلب قبل الإرسال (لتمرير التوكن تلقائياً من المتصفح)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 🌟 2. اعتراض الرد القادم من السيرفر (التعديل الأمني الجديد للطرد التلقائي) 🌟
// 🌟 اعتراض الرد القادم من السيرفر (المصحح) 🌟
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // 🌟 التعديل السحري: لا تقم بعمل ريفريش وطرد إذا كان العميل أصلاً في صفحة الدخول أو التسجيل 🌟
      // هذا سيعطيه الوقت الكافي لقراءة رسائل الخطأ بهدوء!
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        console.log("جاري طردك من النظام...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;
