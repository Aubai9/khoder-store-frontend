// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // تخزين إشارة تثبيت التطبيق
  // عند تشغيل التطبيق أول مرة، نتأكد إذا كان المستخدم مسجل دخوله مسبقاً
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  // التقاط إشارة تثبيت الـ PWA لمنع المتصفح من إظهار لافتته الافتراضية
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // منع ظهور البوب أب الافتراضي لكروم
      setDeferredPrompt(e); // حفظ الإشارة في الذاكرة لتفعيلها عند ضغط زرنا المخصص
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const loginUser = async (username, password) => {
    try {
      const response = await API.post("/users/login", { username, password });
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(token);
      setUser(userData);

      // التعديل هنا: إرجاع صلاحية المستخدم (role) عند نجاح تسجيل الدخول
      return { success: true, role: userData.role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "فشل تسجيل الدخول",
      };
    }
  };

  // دالة تسجيل الخروج
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginUser,
        logoutUser,
        deferredPrompt,
        setDeferredPrompt,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
