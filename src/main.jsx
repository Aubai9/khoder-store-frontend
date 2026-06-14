// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 🌟 التعديل المضمون 100%: تسجيل السيرفيس ووركر الموحد والخاص بنا يدوياً لمنع أي تعارض 🌟
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/custom-sw.js")
    .then((reg) => console.log("🍿 تم تسجيل السيرفيس ووركر الموحد بنجاح!", reg))
    .catch((err) => console.log("❌ فشل تسجيل السيرفيس ووركر", err));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
