// src/pages/admin/Orders.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { io } from "socket.io-client"; // استيراد بث السوكيت
// استدعاء الأيقونات الفخمة
import {
  FiGrid,
  FiBox,
  FiMonitor,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiHome,
  FiMenu,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiSmartphone,
  FiMapPin,
  FiTruck,
  FiKey,
} from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

import "./Inventory.css"; // لتنسيق الـ Sidebar المتجاوب والـ Layout
import "./Orders.css"; // لتنسيق الكروت والطلبات الخاص بالمدير

function Orders() {
  const { user, logoutUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const [newOrderNotification, setNewOrderNotification] = useState(null);

  // 1. 🌟 حالات نافذة تأكيد الإلغاء 🌟
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // 2. 🌟 دالة فتح النافذة 🌟
  const openCancelConfirm = (id) => {
    setOrderToCancel(id);
    setShowCancelModal(true);
  };

  // 3. 🌟 هذه هي الدالة التي تسأل عنها (دالة تأكيد الإلغاء) 🌟
  const confirmCancel = () => {
    handleUpdateStatus(orderToCancel, "CANCELLED"); // استدعاء دالة تحديث الحالة لإلغاء الطلب
    setShowCancelModal(false); // إخفاء النافذة بعد الإلغاء
  };

  // دالة برمجية تولد صوت "رنة تنبيه فخمة ومزدوجة" بدون الحاجة لملفات خارجية
  const playPingSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // النغمة الأولى (الـ Ding الأولى)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // نغمة D5
      gain1.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.8,
      );
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);

      // النغمة الثانية بعد تأخير 80 مللي ثانية (تأثير الارتداد للرنة)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // نغمة A5
        gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(
          0.0001,
          audioCtx.currentTime + 0.8,
        );
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.8);
      }, 80);

      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log("المتصفح يمنع تشغيل الصوت تلقائياً قبل حدوث أي تفاعل");
    }
  };

  // جلب كل طلبات المتجر للمدير
  const fetchAllOrders = async () => {
    try {
      const res = await API.get("/orders/admin");
      setOrders(res.data);
    } catch (error) {
      console.error("فشل جلب الطلبات", error);
    } finally {
      setLoading(false);
    }
  };

  // تفعيل التقاط إشارات البث الحي (WebSockets)
  useEffect(() => {
    // الاتصال بسيرفر الباك إند
    // التعديل السحابي الموحد ليعمل على الويب الحقيقي بامتياز
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000";

    const socket = io(socketUrl);

    // التقاط إشارة الطلبية الجديدة
    socket.on("newOrderAlert", (data) => {
      playPingSound(); // تشغيل صوت الرنة الفخم فوراً! 🔔
      setNewOrderNotification(data.message); // عرض الإشعار الأحمر للأدمن
      fetchAllOrders(); // تحديث قائمة الطلبات بالجدول تلقائياً وبدون ريفريش!

      // إخفاء إشعار الأدمن تلقائياً بعد 6 ثوانٍ
      setTimeout(() => {
        setNewOrderNotification(null);
      }, 6000);
    });

    // تنظيف الاتصال عند الخروج من الصفحة
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // دالة لتحديث حالة الطلب (تجهيز وشحن الطلبية)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchAllOrders(); // تحديث القائمة فوراً
    } catch (error) {
      {
      }
      <button
        className="ship-btn"
        style={{ backgroundColor: "#ef4444" }}
        onClick={() => triggerCancelConfirm(order.id)}
      >
        <FiXCircle size={16} /> إلغاء
      </button>;
    }
  };

  // دالة لتنسيق حالة الطلب بالعربي
  const getStatusDisplay = (status) => {
    switch (status) {
      case "PENDING":
        return { text: "قيد الانتظار 🕒", class: "status-pending" };
      case "COMPLETED":
        return { text: "مكتمل ومُسلم ✅", class: "status-completed" };
      case "CANCELLED":
        return { text: "ملغي ❌", class: "status-cancelled" };
      default:
        return { text: status, class: "status-pending" };
    }
  };

  return (
    <div className="admin-layout">
      {/* 1. القائمة الجانبية (Sidebar) المصححة بالكامل */}
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

        {/* القائمة الخاصة باللابتوب (تأكدنا أن الروابط بداخلها) */}
        <div className="sidebar-menu">
          <Link to="/admin/dashboard" className="menu-item">
            <FiGrid size={18} /> لوحة التحكم
          </Link>
          <Link to="/admin/inventory" className="menu-item">
            <FiBox size={18} /> المخزون
          </Link>
          <div className="menu-item active">
            <FiFileText size={18} /> الطلبات
          </div>
          <Link to="/admin/pos" className="menu-item">
            <FiMonitor size={18} /> نقطة البيع
          </Link>
          <Link
            to="/admin/customers"
            className="menu-item"
            style={{ textDecoration: "none", color: "#94a3b8" }}
          >
            <FiUsers size={18} /> العملاء والديون
          </Link>
          <Link
            to="/admin/approvals"
            className="menu-item"
            style={{ textDecoration: "none", color: "#94a3b8" }}
          >
            <FiKey size={18} /> الأذونات
          </Link>
        </div>

        {/* القسم السفلي المتجاوب للعودة والخروج */}
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
                  <Link
                    to="/admin/dashboard"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiGrid size={16} /> لوحة التحكم
                  </Link>

                  <Link
                    to="/admin/inventory"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiBox size={16} /> المخزون
                  </Link>

                  {/* الخيار النشط هنا هو الطلبات */}
                  <div
                    className="dropdown-item active-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiFileText size={16} /> الطلبات
                  </div>

                  {/* الخيارات المعطلة */}
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
                    <FiKey size={16} /> الأذونات
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
      {/* 2. منطقة محتوى الطلبات (يسار الصفحة) */}
      <main className="inventory-content">
        <div className="inventory-header">
          <h1>إدارة الطلبات الواردة</h1>
        </div>

        {loading ? (
          <p>جاري تحميل الطلبات...</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            لا توجد طلبات مسجلة في المتجر حالياً.
          </p>
        ) : (
          <div className="orders-admin-list">
            {orders.map((order) => {
              const statusData = getStatusDisplay(order.status);
              const orderDate = new Date(order.createdAt).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // نظام 12 ساعة (AM/PM)
                },
              );

              return (
                <div className="order-admin-card" key={order.id}>
                  {/* كارت رأس الطلبية */}
                  <div className="order-admin-header">
                    <h3>طلب رقم #{order.id}</h3>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {orderDate}
                    </span>
                  </div>

                  {/* كارت محتويات وتفاصيل الطلبية */}
                  <div className="order-admin-body">
                    {/* معلومات العميل (تفريق ذكي وتوضيح للمشتري) */}
                    <div className="client-info-box">
                      {order.address.includes("POS") ? (
                        <>
                          <h4
                            style={{ borderColor: "#22c55e", color: "#15803d" }}
                          >
                            <FiMonitor /> مبيع مباشر (نقطة البيع)
                          </h4>

                          <p
                            style={{
                              color: "#15803d",
                              fontWeight: "bold",
                              fontSize: "14px",
                              background: "#f0fdf4",
                              padding: "8px",
                              borderRadius: "8px",
                              width: "fit-content",
                            }}
                          >
                            تم الدفع كاش والاستلام في المحل 💵
                          </p>

                          {/* 🌟 التعديل هنا: إظهار اسم العميل إذا تم تحديده، أو إظهار "عميل نقدي" 🌟 */}
                          <div
                            style={{
                              marginTop: "15px",
                              padding: "10px",
                              backgroundColor: "#f8fafc",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <p style={{ margin: 0, color: "#001f3f" }}>
                              <FiUser color="#ff6b00" />{" "}
                              <strong>العميل المشتري: </strong>
                              {/* إذا كان معرف الطلب يطابق معرف المدير، يعني لم يحدد عميلاً (كاش عام). وإلا يطبع اسم العميل */}
                              {order.userId === user.id ? (
                                <span style={{ color: "#64748b" }}>
                                  عميل نقدي (عام)
                                </span>
                              ) : (
                                <span
                                  style={{
                                    color: "#ff6b00",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {order.user.name} ({order.user.username})
                                </span>
                              )}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <h4>معلومات الشحن والعميل</h4>
                          <p>
                            <FiUser /> <strong>اسم المسؤول:</strong>{" "}
                            {order.user.name}
                          </p>
                          <p>
                            <MdOutlineStorefront color="#ff6b00" />{" "}
                            <strong>اسم المتجر المطلوب:</strong>{" "}
                            <span
                              style={{ color: "#ff6b00", fontWeight: "bold" }}
                            >
                              {order.user.username}
                            </span>
                          </p>
                          <p>
                            <FiSmartphone /> <strong>رقم واتس المتجر:</strong>{" "}
                            {order.user.whatsapp}
                          </p>
                          <p>
                            <FiMapPin /> <strong>العنوان بالتفصيل:</strong>{" "}
                            {order.address}
                          </p>
                          <p>
                            <FiSmartphone /> <strong>رقم هاتف الشحن:</strong>{" "}
                            {order.phone}
                          </p>
                        </>
                      )}
                    </div>

                    {/* تفاصيل المنتجات والأسعار */}
                    <div className="order-items-box">
                      <h4>المنتجات المطلوبة</h4>
                      <table className="order-products-table">
                        <thead>
                          <tr>
                            <th>السلعة</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontWeight: "bold" }}>
                                {item.product.name}
                              </td>
                              <td>{item.quantity} قطع</td>
                              <td>${item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* المجموع الكلي وزر الإجراء الإداري للشحن */}
                      {/* المجموع الكلي وأزرار الإجراء الإداري */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "20px",
                          paddingTop: "15px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>
                            المجموع الإجمالي:{" "}
                          </span>
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "800",
                              color: "#001f3f",
                            }}
                          >
                            ${order.totalPrice.toFixed(2)}
                          </span>
                        </div>

                        {order.status === "PENDING" ? (
                          <div style={{ display: "flex", gap: "10px" }}>
                            {/* زر الشحن */}
                            <button
                              className="ship-btn"
                              onClick={() =>
                                handleUpdateStatus(order.id, "COMPLETED")
                              }
                            >
                              <FiTruck size={16} /> شحن الطلبية
                            </button>

                            {/* 🌟 الزر المعدل: يفتح النافذة الفخمة بدلاً من الـ alert 🌟 */}
                            <button
                              className="ship-btn"
                              style={{ backgroundColor: "#ef4444" }}
                              onClick={() => openCancelConfirm(order.id)}
                            >
                              <FiXCircle size={16} /> إلغاء
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`order-status ${statusData.class}`}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                            }}
                          >
                            {statusData.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* إشعار عائم أحمر فخم للمدير عند ورود طلبية حية */}
      {newOrderNotification && (
        <div
          className="pwa-toast"
          style={{
            backgroundColor: "#ef4444",
            bottom: "auto",
            top: "20px",
            borderTop: "none",
            borderRight: "5px solid #b91c1c",
          }}
        >
          <span style={{ fontSize: "18px" }}>🚨</span> {newOrderNotification}
        </div>
      )}

      {/* 🌟 نافذة تأكيد الإلغاء الفخمة (بديلة عن window.confirm) 🌟 */}
      {showCancelModal && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <span className="confirm-icon">
              <FiXCircle size={45} />
            </span>
            <h3>إلغاء الطلبية</h3>
            <p>
              هل أنت متأكد من إلغاء هذا الطلب؟ سيتم إرجاع البضاعة للمخزن
              تلقائياً.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-btn btn-cancel"
                onClick={() => setShowCancelModal(false)}
              >
                تراجع
              </button>
              <button
                type="button"
                className="confirm-btn btn-danger-confirm"
                onClick={confirmCancel}
              >
                نعم، قم بالإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
