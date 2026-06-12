// src/pages/admin/POS.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

import {
  FiGrid,
  FiBox,
  FiMonitor,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiHome,
  FiMenu,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiDollarSign,
  FiAlertTriangle,
  FiSearch,
  FiUser,
  FiCheckCircle,
  FiKey,
} from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

import "./Inventory.css"; // للسايدبار
import "./POS.css"; // لتنسيق شاشة الكاشير

function POS() {
  const { user, logoutUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]); // State للعملاء
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastError, setToastError] = useState("");
  // سلة الكاشير المحلية (مستقلة عن سلة التطبيق)
  const [posCart, setPosCart] = useState([]);
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();
  const [customerSearch, setCustomerSearch] = useState(""); // نص البحث عن العميل
  const [selectedCustomerId, setSelectedCustomerId] = useState(""); // ID العميل المختار (فارغ يعني نقدي)
  // 🌟 حالة ودالة نافذة تأكيد إفراغ فاتورة الكاشير 🌟
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // هذه الدالة التي يبحث عنها المتصفح!
  const handleConfirmCancel = () => {
    clearPosCart(); // إفراغ السلة
    setShowClearConfirm(false); // إخفاء النافذة بعد المسح
  };
  // جلب المخزون
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await API.get("/products");
        setProducts(prodRes.data);

        // جلب قائمة العملاء للكاشير
        const custRes = await API.get("/admin/customers");
        setCustomers(custRes.data);
      } catch (error) {
        console.error("فشل جلب البيانات", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const triggerErrorToast = (msg) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 4000);
  };

  // 🌟 حالة ودالة الإشعار الأخضر الفخم للنجاح 🌟
  const [toastSuccess, setToastSuccess] = useState("");

  const triggerSuccessToast = (msg) => {
    setToastSuccess(msg);
    setTimeout(() => setToastSuccess(""), 4000);
  };

  const parseImages = (urlStr) => {
    if (!urlStr) return [];
    return urlStr
      .split(/(?=https?:\/\/)/)
      .map((img) => img.replace(/,+$/, "").trim())
      .filter(Boolean);
  };

  const getOptimizedImage = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/w_800,q_auto,f_auto/");
  };

  const normalizeArabic = (text) => {
    if (!text) return "";
    return text
      .toString()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .toLowerCase()
      .trim();
  };

  // إضافة منتج للفاتورة
  const addToPosCart = (product) => {
    if (product.stock < 1) {
      triggerErrorToast("عذراً، هذا المنتج غير متوفر في المخزن حالياً! "); // تم استبدال الـ alert
      return;
    }

    setPosCart((prev) => {
      const exist = prev.find((item) => item.product.id === product.id);
      if (exist) {
        if (exist.qty >= product.stock) return prev; // منع تخطي المخزون
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  // تعديل الكمية بالفاتورة
  const updatePosQty = (id, delta) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null; // سيتم فلترته لاحقاً
            if (newQty > item.product.stock) return item;
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const clearPosCart = () => setPosCart([]);

  const posTotal = posCart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );

  // إتمام الدفع (دفع كاش)
  const handleCashPayment = async () => {
    if (posCart.length === 0) return;
    setPaying(true);

    const orderItems = posCart.map((item) => ({
      productId: item.product.id,
      quantity: item.qty,
    }));

    try {
      await API.post("/orders", {
        address: "مبيعات الكاشير المباشرة (POS)",
        phone: "0000000000",
        status: "COMPLETED",
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null, // 🌟 التعديل هنا لضمان الإرسال كرقم
        items: orderItems,
      });

      // تشغيل صوت "كاشير" بسيط إذا أردت
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);

      triggerSuccessToast(
        "تم الدفع بنجاح! تم خصم الكمية من المخزن وتسجيل الطلب. ",
      );

      clearPosCart();
      // تحديث المنتجات لرؤية المخزون الجديد
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (error) {
      alert("فشل إتمام العملية");
    } finally {
      setPaying(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())),
  );
  // فلترة العملاء ذكياً بناءً على اسم المتجر أو اسم المسؤول (تجاهل الهمزات)
  // فلترة العملاء ذكياً مع التركيز على اسم المتجر
  const filteredCustomers = customers.filter((c) => {
    const query = normalizeArabic(customerSearch);
    return (
      normalizeArabic(c.username).includes(query) ||
      normalizeArabic(c.name).includes(query)
    );
  });

  // فتح نافذة الإلغاء
  const openCancelConfirm = (id) => {
    setOrderToCancel(id);
    setShowCancelModal(true);
  };

  // تأكيد الإلغاء
  const showCancelConfirm = () => {
    handleUpdateStatus(orderToCancel, "CANCELLED");
    setShowCancelModal(false);
  };
  return (
    <div className="admin-layout">
      {/* 1. القائمة الجانبية الموحدة */}
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
          <Link to="/admin/dashboard" className="menu-item">
            <FiGrid size={18} /> لوحة التحكم
          </Link>
          <Link to="/admin/inventory" className="menu-item">
            <FiBox size={18} /> المخزون
          </Link>
          <Link to="/admin/orders" className="menu-item">
            <FiFileText size={18} /> الطلبات
          </Link>
          <div className="menu-item active">
            <FiMonitor size={18} /> نقطة البيع
          </div>
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
                  <Link
                    to="/admin/orders"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiFileText size={16} /> الطلبات
                  </Link>
                  <div
                    className="dropdown-item active-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiMonitor size={16} /> نقطة البيع
                  </div>
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

      {/* 2. منطقة الكاشير */}
      <main className="inventory-content">
        <div className="inventory-header">
          <h1>نقطة البيع الكاشير </h1>
        </div>

        <div className="pos-layout-wrapper">
          {/* قسم المنتجات (اليمين) */}
          <div className="pos-products-section">
            <input
              type="text"
              className="pos-search-input"
              placeholder="ابحث باسم المنتج أو رقم الباركود (SKU)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
              <p>جاري تحميل البضائع...</p>
            ) : (
              <div className="pos-grid">
                {filteredProducts.map((product) => {
                  const productImages = parseImages(product.imageUrl);
                  const firstImage = productImages[0];

                  return (
                    <div
                      className="pos-card"
                      key={product.id}
                      onClick={() => addToPosCart(product)}
                    >
                      <div className="pos-card-image">
                        {firstImage ? (
                          <img
                            src={getOptimizedImage(firstImage)}
                            alt={product.name || "منتج"}
                          />
                        ) : (
                          <span className="pos-card-placeholder">📦</span>
                        )}
                      </div>
                      <h4>{product.name}</h4>
                      <span className="price">${product.price}</span>
                      <span className="stock">المخزن: {product.stock}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* قسم الفاتورة (اليسار) */}
          <div className="pos-receipt-section">
            <div className="pos-receipt-header">
              <span>الفاتورة الحالية</span>
              {/* التعديل: تفعيل فتح النافذة المنبثقة عند الضغط على السلة */}
              <FiTrash2
                style={{ cursor: "pointer", color: "#ef4444" }}
                onClick={() => setShowClearConfirm(true)}
                title="إفراغ الفاتورة"
              />
            </div>
            {/* 🌟 القسم الجديد: البحث الذكي واختيار العميل للفاتورة 🌟 */}
            <div className="pos-customer-section">
              <label>البحث والعميل</label>
              <input
                type="text"
                className="pos-customer-search-input"
                placeholder="ابحث عن اسم المتجر أو المسؤول..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              <select
                className="pos-customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value=""> عميل نقدي </option>
                {filteredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="pos-receipt-items">
              {posCart.length === 0 ? (
                <p
                  style={{
                    color: "#94a3b8",
                    textAlign: "center",
                    marginTop: "50px",
                  }}
                >
                  الفاتورة فارغة، انقر على المنتجات لإضافتها.
                </p>
              ) : (
                posCart.map((item) => (
                  <div className="receipt-item" key={item.product.id}>
                    <div>
                      <h4>{item.product.name}</h4>
                      <span className="price">${item.product.price}</span>
                    </div>
                    <div className="receipt-qty-controls">
                      <button onClick={() => updatePosQty(item.product.id, -1)}>
                        <FiMinus size={12} />
                      </button>
                      <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        {item.qty}
                      </span>
                      <button onClick={() => updatePosQty(item.product.id, 1)}>
                        <FiPlus size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pos-receipt-footer">
              <div className="pos-total-row">
                <span>المجموع:</span>
                <span style={{ color: "#ff6b00" }}>${posTotal.toFixed(2)}</span>
              </div>
              <button
                className="pos-pay-btn"
                disabled={posCart.length === 0 || paying}
                onClick={handleCashPayment}
              >
                <FiDollarSign size={20} />
                {paying ? "جاري الدفع..." : "  تسجيل الطلب"}
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* عرض إشعار الخطأ العائم المطور والآمن في الكاشير */}
      {toastError && (
        <div
          className="pwa-toast pwa-toast-error"
          role="alert"
          aria-live="assertive"
        >
          <FiAlertTriangle size={18} /> {toastError}
        </div>
      )}
      {toastSuccess && (
        <div
          className="pwa-toast"
          style={{
            bottom: "auto",
            top: "20px",
            borderTop: "none",
            borderRight: "5px solid #22c55e",
            backgroundColor: "#f0fdf4",
            color: "#15803d",
          }}
        >
          <FiCheckCircle size={18} color="#22c55e" /> {toastSuccess}
        </div>
      )}

      {/* 🌟 نافذة تأكيد إفراغ فاتورة الكاشير 🌟 */}
      {showClearConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <span className="confirm-icon">
              <FiTrash2 size={45} />
            </span>
            <h3>إفراغ الفاتورة بالكامل</h3>
            <p>هل أنت متأكد من مسح جميع المنتجات من هذه الفاتورة؟</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-btn btn-cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                تراجع
              </button>
              <button
                type="button"
                className="confirm-btn btn-danger-confirm"
                onClick={handleConfirmCancel}
              >
                نعم، إفراغ الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POS;
