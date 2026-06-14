// src/pages/admin/Dashboard.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

// استيراد الأيقونات الموحدة والفاخرة
import {
  FiGrid,
  FiBox,
  FiMonitor,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiHome,
  FiMenu,
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiBell,
  FiSettings,
} from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

import "./Inventory.css";
import "./Dashboard.css";

function Dashboard() {
  const { user, logoutUser } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // حالات إعدادات البانر الإعلاني
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // حالة الإشعار الفخم للوحة التحكم
  const [toastMsg, setToastMsg] = useState("");
  // 🌟 التعديل المطور: القراءة الفورية المتزامنة من الـ LocalStorage عند فتح الصفحة 🌟
  const [isSubscribed, setIsSubscribed] = useState(
    localStorage.getItem("isSubscribed") === "true",
  );

  const navigate = useNavigate();

  // دالة تشغيل الإشعار المنبثق الفخم
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // جلب البيانات من السيرفر عند تحميل الصفحة
  const fetchStats = async () => {
    try {
      // 1. جلب الإحصائيات العامة والطلبات الحديثة
      const res = await API.get("/admin/stats");
      setStats(res.data);

      // 2. جلب إعدادات البانر الحالية
      const settingsRes = await API.get("/admin/settings");
      setHeroTitle(settingsRes.data.heroTitle);
      setHeroSubtitle(settingsRes.data.heroSubtitle);
      setHeroImageUrl(settingsRes.data.heroImageUrl || "");
    } catch (error) {
      console.error("فشل جلب البيانات في لوحة التحكم", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // فحص هل المتصفح مشترك ومفعل للإشعارات مسبقاً على هذا الجهاز
  // فحص خلفي صامت لتأكيد التفعيل فقط (بدون أي مسح أو تصفير عشوائي عند التحميل) [3]
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        for (let reg of registrations) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setIsSubscribed(true);
            localStorage.setItem("isSubscribed", "true"); // تأكيد الحفظ
            break;
          }
        }
      });
    }
  }, []);

  // دالة تحويل تشفير المفتاح (مطلوبة تقنياً لمتصفحات الجوال)
  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // دالة طلب الإذن من المتصفح وتفعيل اشتراك الإشعارات المغلقة
  // دالة طلب الإذن من المتصفح وتفعيل الاشتراك المباشر لـ custom-sw.js
  // دالة طلب الإذن والتفعيل السحابي الرسمي باستخدام السيرفيس ووركر الجاهز للتطبيق [3]
  const subscribeToNotifications = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          showToast(" يجب السماح بالإشعارات من إعدادات المتصفح أولاً.");
          return;
        }

        showToast("جاري تهيئة الاتصال السحابي..");

        // 🌟 التعديل النهائي والمنقذ: استخدام السيرفيس ووركر الرسمي المفعّل مسبقاً للموقع 🌟
        const registration = await navigator.serviceWorker.ready;
        console.log("تم الاتصال بالسيرفيس ووركر الرسمي:", registration);

        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        // توليد كود الاشتراك المشفر بشكل رسمي وثابت [3]
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        // إرسال الكود للباك إند لحفظه
        // إرسال الكود للباك إند لحفظه
        await API.post("/admin/push-subscription", { subscription });

        // 🌟 السطر الجديد: الحفظ الفوري المتزامن في المتصفح 🌟
        localStorage.setItem("isSubscribed", "true");

        showToast("تم تفعيل إشعارات الموبايل المغلق بنجاح! ");
        setIsSubscribed(true);
      } catch (error) {
        console.error("فشل تفعيل الإشعارات:", error);
        showToast(" فشل تفعيل الإشعارات السحابية.");
      }
    } else {
      showToast(" متصفحك لا يدعم إشعارات الدفع المغلقة.");
    }
  };

  // دالة رفع صورة البانر السحابية لـ Cloudinary
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      );
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      setHeroImageUrl(data.secure_url);
    } catch (err) {
      showToast("❌ فشل رفع صورة البانر");
    } finally {
      setUploading(false);
    }
  };

  // دالة حفظ ونشر البانر الجديد للمتجر
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      await API.put("/admin/settings", {
        heroTitle,
        heroSubtitle,
        heroImageUrl,
      });
      showToast("تم تحديث البانر في واجهة المتجر بنجاح! 🎉");
    } catch (error) {
      showToast("❌ فشل تحديث البانر");
    }
  };

  return (
    <div className="admin-layout">
      {/* القائمة الجانبية (Sidebar) */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <MdOutlineStorefront size={26} /> لوحة الإدارة
          </h2>
          <p style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
            {user?.name}
          </p>
        </div>

        <div className="sidebar-menu">
          <div className="menu-item active">
            <FiGrid size={18} /> لوحة التحكم
          </div>
          <Link
            to="/admin/inventory"
            className="menu-item"
            style={{ textDecoration: "none" }}
          >
            <FiBox size={18} /> المخزون
          </Link>
          <Link
            to="/admin/orders"
            className="menu-item"
            style={{ textDecoration: "none" }}
          >
            <FiFileText size={18} /> الطلبات
          </Link>
          <Link
            to="/admin/pos"
            className="menu-item"
            style={{ textDecoration: "none" }}
          >
            <FiMonitor size={18} /> نقطة البيع
          </Link>
          <Link
            to="/admin/customers"
            className="menu-item"
            style={{ textDecoration: "none" }}
          >
            <FiUsers size={18} /> العملاء والديون
          </Link>
          <Link
            to="/admin/approvals"
            className="menu-item"
            style={{ textDecoration: "none" }}
          >
            <FiSettings size={18} /> الأذونات
          </Link>
        </div>

        {/* أزرار العودة والخروج */}
        <div className="sidebar-footer-wrapper">
          <div className="sidebar-footer-desktop">
            <div onClick={() => navigate("/")} className="footer-btn-store">
              <FiHome size={18} /> العودة للمتجر
            </div>
            <div
              onClick={() => {
                logoutUser();
                navigate("/login");
              }}
              className="footer-btn-logout"
            >
              <FiLogOut size={18} /> تسجيل خروج
            </div>
          </div>

          <div className="sidebar-footer-mobile">
            <button
              className="mobile-menu-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FiMenu size={24} />
            </button>
            {showDropdown && (
              <>
                <div
                  className="dropdown-backdrop"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="admin-dropdown-menu">
                  <div
                    className="dropdown-item active-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiGrid size={16} /> لوحة التحكم
                  </div>
                  <Link
                    to="/admin/inventory"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiBox size={16} /> المخزون
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiFileText size={16} /> الطلبات
                  </Link>
                  <Link
                    to="/admin/pos"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiMonitor size={16} /> نقطة البيع
                  </Link>
                  <Link
                    to="/admin/customers"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiUsers size={16} /> العملاء والديون
                  </Link>
                  <Link
                    to="/admin/approvals"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiSettings size={16} /> الأذونات
                  </Link>
                  <div className="dropdown-divider"></div>
                  <div
                    onClick={() => {
                      navigate("/");
                      setShowDropdown(false);
                    }}
                    className="dropdown-item item-store"
                  >
                    <FiHome size={16} /> العودة للمتجر
                  </div>
                  <div
                    onClick={() => {
                      logoutUser();
                      navigate("/login");
                      setShowDropdown(false);
                    }}
                    className="dropdown-item item-logout"
                  >
                    <FiLogOut size={16} /> تسجيل خروج
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* منطقة محتوى لوحة التحكم (اليمين) */}
      <main className="inventory-content">
        <div
          className="inventory-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>نظرة عامة على المتجر </h1>

          {/* زر تفعيل إشعارات الدفع الذكي المتغير */}
          <button
            className="add-product-btn"
            onClick={isSubscribed ? null : subscribeToNotifications}
            style={{
              backgroundColor: isSubscribed ? "#475569" : "#001f3f",
              color: "#fff",
              padding: "10px 15px",
              fontSize: "13px",
              cursor: isSubscribed ? "default" : "pointer",
              boxShadow: isSubscribed
                ? "none"
                : "0 4px 12px rgba(0, 31, 63, 0.15)",
            }}
          >
            <FiBell size={16} />
            {isSubscribed
              ? "الإشعارات مفعلة على هذا الجهاز "
              : "تفعيل الإشعارات للجهاز "}
          </button>
        </div>

        {loading || !stats ? (
          <p style={{ textAlign: "center", marginTop: "50px" }}>
            جاري تحميل الإحصائيات...
          </p>
        ) : (
          <>
            {/* 1. كروت الإحصائيات العلوية */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper bg-orange">
                  <FiDollarSign />
                </div>
                <div className="stat-info">
                  <h3>${stats.totalInventoryValue.toFixed(2)}</h3>
                  <p>إجمالي قيمة المخزون</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper bg-blue">
                  <FiShoppingBag />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>الطلبات المستلمة</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper bg-green">
                  <FiBox />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalProducts}</h3>
                  <p>إجمالي أنواع المنتجات</p>
                </div>
              </div>
            </div>

            {/* 2. القسم السفلي */}
            <div className="dashboard-bottom-grid">
              {/* جدول مصغر لأحدث الطلبات */}
              <div className="dashboard-panel">
                <h3>
                  <FiTrendingUp color="#ff6b00" /> أحدث الطلبات الواردة
                </h3>
                {stats.recentOrders.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#888" }}>
                    لا توجد طلبات حديثة.
                  </p>
                ) : (
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>رقم الطلب</th>
                        <th>اسم المتجر</th>
                        <th>السعر</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td style={{ fontWeight: "bold", color: "#001f3f" }}>
                            {order.user.username}
                          </td>
                          <td style={{ fontWeight: "bold", color: "#ff6b00" }}>
                            ${order.totalPrice.toFixed(2)}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "bold",
                                color:
                                  order.status === "PENDING"
                                    ? "#ea580c"
                                    : "#16a34a",
                              }}
                            >
                              {order.status === "PENDING"
                                ? "قيد الانتظار 🕒"
                                : "مكتمل "}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <Link
                  to="/admin/orders"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "15px",
                    color: "#ff6b00",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  عرض كل الطلبات ⬅
                </Link>
              </div>

              {/* 3. قسم التحكم بالبانر الإعلاني */}
              <form
                className="dashboard-panel"
                style={{ marginTop: "25px", gridColumn: "1 / -1" }}
                onSubmit={handleSaveBanner}
              >
                <h3>
                  <FiMonitor color="#ff6b00" /> إعدادات البانر الإعلاني (واجهة
                  المتجر)
                </h3>
                <div className="modal-grid-2">
                  <div className="form-group">
                    <label>العنوان الصغير (مثال: تشكيلة جديدة)</label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>النص الكبير (مثال: 20% خصم)</label>
                    <input
                      type="text"
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: "15px" }}>
                  <label
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>صورة البانر (اختياري - يفضل صورة عريضة)</span>
                    {heroImageUrl && (
                      <span
                        onClick={() => setHeroImageUrl("")}
                        style={{
                          color: "red",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✕ مسح الصورة
                      </span>
                    )}
                  </label>
                  <div className="modal-image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      id="hero-upload"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="hero-upload"
                      className="upload-label-btn"
                      style={{ margin: 0 }}
                    >
                      {uploading ? "⏳ جاري الرفع..." : "📁 اختر صورة للبانر"}
                    </label>
                    {heroImageUrl && (
                      <img
                        src={heroImageUrl}
                        alt="Hero"
                        style={{
                          height: "50px",
                          borderRadius: "8px",
                          marginLeft: "15px",
                        }}
                      />
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="add-product-btn"
                  style={{ marginTop: "15px" }}
                >
                  حفظ البانر ونشره
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* الإشعارات العائمة للوحة التحكم */}
      {toastMsg && (
        <div
          className="pwa-toast"
          style={{
            bottom: "auto",
            top: "20px",
            borderTop: "none",
            borderRight: "5px solid #22c55e",
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
          }}
        >
          <FiCheckCircle size={18} color="#22c55e" /> {toastMsg}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
