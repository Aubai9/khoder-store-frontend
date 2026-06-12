// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Auth.css";

// الاستيراد الصحيح للأيقونات بدون أي خطأ
import {
  FiUser,
  FiLock,
  FiSmartphone,
  FiShoppingBag,
  FiPhone,
} from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // فحص قوة الباسوورد بالفرونت إند قبل إرساله للسيرفر
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "كلمة المرور ضعيفة! يجب أن تكون 8 خانات على الأقل وتحتوي على حرف كبير، حرف صغير، ورقم.",
      );
      return;
    }
    e.preventDefault();
    setError("");

    try {
      await API.post("/users/register", { name, username, whatsapp, password });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error || "فشل إنشاء الحساب، يرجى المحاولة لاحقاً",
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {/* أيقونة الشعار */}
          <FiShoppingBag
            size={35}
            color="#001f3f"
            style={{ marginBottom: "8px" }}
          />
          <h2>إنشاء حساب متجر جديد</h2>
          <p>أدخل بيانات متجرك للبدء في عرض منتجاتك وتلقي الطلبات</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label> الاسم </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FiUser className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label> اسم المتجر</label>
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
            <label> الرقم </label>
            <div className="input-wrapper">
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                placeholder="مثال: 09xxxxxxxx"
                dir="ltr"
              />
              <FiPhone className="input-icon" size={18} />
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
            {/* توضيح شروط الباسوورد للزبون */}
            <span
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "5px",
                display: "block",
              }}
            >
              💡 يجب أن تكون 8 خانات على الأقل (حرف كبير، حرف صغير، ورقم).
            </span>
          </div>

          <button type="submit" className="auth-btn">
            تسجيل المتجر
          </button>
        </form>

        <p className="auth-link">
          لديك متجر بالفعل؟ <Link to="/login">تسجيل الدخول باسم المتجر</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
