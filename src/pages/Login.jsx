// src/pages/Login.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";

// استدعاء الأيقونات الموحدة
import { FiLock, FiShoppingBag, FiUser, FiSmartphone } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

function Login() {
  const [username, setUsername] = useState(""); // اسم المتجر
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // حالات نافذة "نسيت الباسوورد" المخصصة
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStoreName, setForgotStoreName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await loginUser(username, password);
    if (result.success) {
      if (result.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } else {
      setError(result.error);
    }
  };

  // دالة إرسال طلب استعادة الباسوورد للواتساب المنسق
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotStoreName) return;

    // تم وضع رقمك الحقيقي 0997008722 لتجرب الميزة وتعمل معك فوراً! 🌟
    const ADMIN_NUMBER = "963997008722";
    const msg = `*طلب استعادة كلمة المرور* 🔑%0Aمرحباً متجر PWA، لقد نسيت كلمة المرور الخاصة بحسابي:%0A*اسم المتجر:* ${forgotStoreName}%0Aيرجى إعادة تعيين كلمة مرور جديدة لي.`;

    // فتح الواتساب تلقائياً برسالة منسقة
    window.location.href = `https://api.whatsapp.com/send?phone=${ADMIN_NUMBER}&text=${msg}`;

    setShowForgotModal(false);
    setForgotStoreName("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiShoppingBag
            size={35}
            color="#001f3f"
            style={{ marginBottom: "8px" }}
          />
          <h2>تسجيل دخول </h2>
          <p>يرجى إدخال اسم متجرك وكلمة المرور للمتابعة</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المتجر</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <MdOutlineStorefront className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <FiLock className="input-icon" size={18} />
            </div>

            {/* زر نسيت الباسوورد المطور */}
            <span
              onClick={() => setShowForgotModal(true)}
              style={{
                fontSize: "12px",
                color: "#ff6b00",
                cursor: "pointer",
                display: "block",
                marginTop: "8px",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              نسيت كلمة المرور؟
            </span>
          </div>

          <button type="submit" className="auth-btn">
            دخول إلى المتجر
          </button>
        </form>

        <p className="auth-link">
          ليس لديك متجر مسجل؟ <Link to="/register">تسجيل متجر جديد</Link>
        </p>
      </div>

      {/* 🌟 نافذة نسيت كلمة المرور المنبثقة الفخمة بديلة الـ prompt 🌟 */}
      {showForgotModal && (
        <div className="auth-modal-overlay">
          <form
            className="auth-modal-card"
            onSubmit={handleForgotPasswordSubmit}
          >
            <h3>استعادة كلمة المرور</h3>
            <p>
              الرجاء إدخال اسم متجرك للتواصل مع الإدارة تلقائياً عبر الواتساب
              لتوليد كلمة مرور جديدة لك.
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>اسم المتجر الخاص بك</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={forgotStoreName}
                  onChange={(e) => setForgotStoreName(e.target.value)}
                  required
                />
                <MdOutlineStorefront className="input-icon" size={18} />
              </div>
            </div>

            <div className="auth-modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowForgotModal(false)}
              >
                إلغاء الأمر
              </button>
              <button
                type="submit"
                className="auth-btn"
                style={{ padding: "10px 20px", width: "auto", margin: 0 }}
              >
                أرسل الطلب
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
