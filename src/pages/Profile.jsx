// src/pages/Profile.jsx
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

import {
  FiUser,
  FiSmartphone,
  FiPackage,
  FiLogOut,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiHome,
  FiSearch,
  FiSettings,
  FiDownload,
} from "react-icons/fi";
import { FaSearch, FaHome } from "react-icons/fa";
import "./Home.css";
import "./Profile.css";

function Profile() {
  const { user, logoutUser, deferredPrompt, setDeferredPrompt } =
    useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await API.get("/orders/my");
        setOrders(res.data);
      } catch (error) {
        console.error("فشل جلب الطلبات", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate]);

  // دالة تشغيل بوب أب التثبيت المخصص للـ PWA عند نقر الزر
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    // إظهار بوب أب التثبيت الأصلي للكروم بأمر من زرنا المخصص
    deferredPrompt.prompt();

    // انتظار اختيار العميل (هل وافق أم رفض التثبيت)
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("الزبون وافق على تثبيت التطبيق بنجاح! 🎉");
      setDeferredPrompt(null); // إخفاء الزر بعد نجاح التثبيت
    } else {
      console.log("الزبون رفض تثبيت التطبيق");
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "PENDING":
        return {
          text: "قيد المراجعة",
          class: "status-pending",
          icon: <FiClock />,
        };
      case "COMPLETED":
        return {
          text: "مكتمل ومُسلم",
          class: "status-completed",
          icon: <FiCheckCircle />,
        };
      case "CANCELLED":
        return { text: "ملغي", class: "status-cancelled", icon: <FiXCircle /> };
      default:
        return { text: status, class: "status-pending", icon: <FiClock /> };
    }
  };

  if (!user) return null;

  return (
    <div className="pwa-app-container">
      {/* 1. الشريط العلوي المتجاوب */}
      <header className="pwa-top-bar">
        <Link to="/" className="pwa-logo">
          <span>N</span> المتجر
        </Link>
        <div className="desktop-nav-links">
          <Link to="/" className="desktop-nav-link">
            الرئيسية
            <FaHome size={16} color="gray" />
          </Link>
          <Link to="/explore" className="desktop-nav-link">
            استكشاف
            <FaSearch size={16} color="gray" />
          </Link>
          {user && user.role === "ADMIN" && (
            <Link to="/admin/dashboard" className="desktop-nav-link admin-link">
              <FiSettings size={16} /> <span>لوحة الإدارة</span>
            </Link>
          )}
        </div>
      </header>

      <main className="profile-content">
        {/* تفعيل التخطيط الجانبي المتجاوب الفخم هنا */}
        <div className="profile-split-layout">
          {/* العمود الأيمن (البروفايل وزر الخروج ملمومين معاً) */}
          <div className="profile-sidebar-section">
            <div className="user-info-card">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h2>{user.name}</h2>
                <p>
                  <FiUser /> {user.username}
                </p>
                <p>
                  <FiSmartphone /> {user.whatsapp}
                </p>
              </div>
            </div>

            {/* 🌟 زر تثبيت التطبيق المخصص: يظهر فقط إذا كان التطبيق قابلاً للتثبيت ولم يثبته العميل بعد 🌟 */}
            {deferredPrompt && (
              <button
                type="button"
                className="pwa-install-btn"
                onClick={handleInstallApp}
              >
                <FiDownload size={18} /> ثبت التطبيق على هاتفك لتجربة أسرع 
              </button>
            )}

            {/* زر تسجيل الخروج تحت زر التثبيت مباشرة */}
            <button
              className="profile-logout-btn"
              onClick={() => {
                logoutUser();
                navigate("/login");
              }}
              style={{ marginTop: deferredPrompt ? "15px" : "30px" }} // مسافة مريحة للعين حسب ظهور الزر
            >
              <FiLogOut size={18} /> تسجيل الخروج من الحساب
            </button>
          </div>

          {/* العمود الأيسر (سجل الطلبات السابقة عريض ومنظم) */}
          <div className="profile-orders-section">
            <h3 className="section-heading">
              <FiPackage /> طلباتي السابقة
            </h3>

            {loading ? (
              <p style={{ textAlign: "center", color: "#64748b" }}>
                جاري تحميل الطلبات...
              </p>
            ) : orders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <FiPackage
                  size={40}
                  color="#cbd5e1"
                  style={{ marginBottom: "10px" }}
                />
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  لم تقم بأي طلبات بعد.
                </p>
                <Link
                  to="/"
                  style={{
                    color: "#ff6b00",
                    fontWeight: "bold",
                    textDecoration: "none",
                    display: "block",
                    marginTop: "10px",
                    fontSize: "14px",
                  }}
                >
                  ابدأ التسوق الآن
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const statusData = getStatusDisplay(order.status);
                  const orderDate = new Date(
                    order.createdAt,
                  ).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div className="order-card" key={order.id}>
                      <div className="order-header">
                        <div>
                          <span className="order-id">طلب #{order.id}</span>
                          <span
                            className="order-date"
                            style={{ display: "block" }}
                          >
                            {orderDate}
                          </span>
                        </div>
                        <span className={`order-status ${statusData.class}`}>
                          {statusData.icon} {statusData.text}
                        </span>
                      </div>

                      <div className="order-body">
                        <span className="order-items-count">
                          {order.orderItems.length} منتجات
                        </span>
                        <span className="order-total">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* شريط التنقل السفلي للموبايل */}
      <nav className="pwa-bottom-nav">
        <Link to="/" className="nav-item">
          <FiHome size={22} className="nav-icon" />
          <span>الرئيسية</span>
        </Link>
        <Link to="/explore" className="nav-item">
          <FiSearch size={22} className="nav-icon" />
          <span>استكشاف</span>
        </Link>

        {user && user.role === "ADMIN" && (
          <Link to="/admin/inventory" className="nav-item">
            <FiSettings size={22} className="nav-icon" />
            <span>الإدارة</span>
          </Link>
        )}

        <Link to="/profile" className="nav-item active">
          <FiUser size={22} className="nav-icon" />
          <span>حسابي</span>
        </Link>
      </nav>
    </div>
  );
}

export default Profile;
