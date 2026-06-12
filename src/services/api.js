// src/services/api.js
import axios from "axios";

const API = axios.create({
  // تأكد أن هذا السطر مكتوب هكذا تماماً لكي يقرأ الرابط من Vercel عند الرفع
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// اعتراض الطلب قبل الإرسال (لتمرير التوكن تلقائياً)
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

// اعتراض الرد القادم من السيرفر (الطرد التلقائي)
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
