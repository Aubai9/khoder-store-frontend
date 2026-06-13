// src/pages/admin/Approvals.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

// استدعاء الأيقونات الموحدة مع إضافة أيقونات الأذونات والقبول
// التعديل الجديد: أضفنا FiAlertTriangle و FiCheckCircle في نهاية السطر
import {
  FiGrid,
  FiBox,
  FiMonitor,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiHome,
  FiMenu,
  FiCheck,
  FiX,
  FiClock,
  FiKey,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

import "./Inventory.css";

function Approvals() {
  const { user, logoutUser } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const [toastSuccess, setToastSuccess] = useState("");
  const [toastError, setToastError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState(null);
  const [confirmApproved, setConfirmApproved] = useState(false);

  const navigate = useNavigate();

  // دالة تفتح المودال وتخزن نوع الإجراء
  const triggerConfirm = (userId, approved) => {
    setConfirmUserId(userId);
    setConfirmApproved(approved);
    setShowConfirm(true);
  };

  // دالة التنفيذ الفعلية بعد تأكيد المدير من النافذة الفخمة
  const handleConfirmAction = async () => {
    try {
      const res = await API.put("/admin/approvals", {
        userId: confirmUserId,
        approved: confirmApproved,
      });
      triggerSuccess(res.data.message);
      setShowConfirm(false); // إغلاق النافذة
      fetchRequests(); // تحديث الجدول فوراً
    } catch (error) {
      triggerError("فشلت معالجة الطلب");
    }
  };

  const triggerSuccess = (msg) => {
    setToastSuccess(msg);
    setTimeout(() => setToastSuccess(""), 5000);
  };

  const triggerError = (msg) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 5000);
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get("/admin/approvals");
      setRequests(res.data);
    } catch (error) {
      console.error("فشل جلب طلبات الانضمام", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // دالة معالجة الطلب (قبول أو رفض)
  const handleAction = async (userId, approved) => {
    const actionText = approved ? "موافقة" : "رفض وحذف";
    if (window.confirm(`هل أنت متأكد من إجراء (${actionText}) لهذا المتجر؟`)) {
      try {
        const res = await API.put("/admin/approvals", { userId, approved });
        triggerSuccess(res.data.message);
        fetchRequests(); // تحديث الجدول فوراً
      } catch (error) {
        triggerError("فشلت معالجة الطلب");
      }
    }
  };

  return (
    <div className="admin-layout">
      {/* 1. القائمة الجانبية (Sidebar) الموحدة والمحدثة بالخيار الجديد */}
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
          <Link
            to="/admin/dashboard"
            className="menu-item"
            style={{ textDecoration: "none", color: "#94a3b8" }}
          >
            <FiGrid size={18} /> لوحة التحكم
          </Link>
          <Link
            to="/admin/inventory"
            className="menu-item"
            style={{ textDecoration: "none", color: "#94a3b8" }}
          >
            <FiBox size={18} /> المخزون
          </Link>
          <Link
            to="/admin/orders"
            className="menu-item"
            style={{ textDecoration: "none", color: "#94a3b8" }}
          >
            <FiFileText size={18} /> الطلبات
          </Link>
          <Link
            to="/admin/pos"
            className="menu-item"
            style={{ textDecoration: "none", color: "#94a3b8" }}
          >
            <FiMonitor size={18} /> نقطة البيع
          </Link>
          <Link
            to="/admin/customers"
            className="menu-item"
            style={{ textDecoration: "none", color: "#94a3b8" }}
          >
            <FiUsers size={18} /> العملاء والديون
          </Link>
          <li className="menu-item active">
            <FiKey size={18} /> الأذونات
          </li>{" "}
          {/* الخيار النشط */}
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
                  <div
                    className="dropdown-item active-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiKey size={16} /> الأذونات
                  </div>
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
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 2. منطقة محتوى طلبات الانضمام */}
      <main className="inventory-content">
        <div className="inventory-header">
          <h1>صلاحيات وأذونات المتاجر</h1>
        </div>

        {loading ? (
          <p>جاري تحميل طلبات الانضمام...</p>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            لا توجد طلبات انضمام معلقة حالياً.
          </p>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>اسم المتجر</th>
                  <th>اسم المسؤول</th>
                  <th>رقم الواتساب للتحقق</th>
                  <th>تاريخ طلب الانضمام</th>
                  <th>حالة الحساب الحالية</th>
                  <th>العمليات والإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const joinDate = new Date(req.createdAt).toLocaleDateString(
                    "ar-EG",
                    { year: "numeric", month: "short", day: "numeric" },
                  );

                  return (
                    <tr key={req.id}>
                      <td style={{ fontWeight: "bold", color: "#001f3f" }}>
                        {req.username}
                      </td>
                      <td>{req.name}</td>
                      <td dir="ltr" style={{ textAlign: "right" }}>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${req.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#01722c",
                            textDecoration: "none",
                            fontWeight: "bold",
                          }}
                        >
                          {req.whatsapp}
                        </a>
                      </td>
                      <td>{joinDate}</td>
                      <td>
                        {req.approved ? (
                          <span className="stock-badge stock-ok">
                            مقبول ومفعّل
                          </span>
                        ) : (
                          <span className="stock-badge stock-warning">
                            بانتظار الموافقة
                          </span>
                        )}
                      </td>
                      <td>
                        {/* إذا كان معلقاً، نظهر أزرار القبول والرفض الفخمة */}
                        {!req.approved ? (
                          <>
                            {/* زر الموافقة المعدل */}
                            <button
                              className="action-btn btn-edit"
                              style={{
                                backgroundColor: "#01722c",
                                minWidth: "70%",
                              }}
                              onClick={() => triggerConfirm(req.id, true)}
                            >
                              <FiCheck size={14} /> موافقة
                            </button>

                            {/* زر الرفض المعدل */}
                            <button
                              className="action-btn btn-delete"
                              style={{ width: "70%" }}
                              onClick={() => triggerConfirm(req.id, false)}
                            >
                              <FiX size={14} /> رفض
                            </button>
                          </>
                        ) : (
                          // زر إلغاء التفعيل للعميل المقبول
                          <button
                            className="action-btn btn-delete"
                            style={{ padding: "6px 15px" }}
                            onClick={() => triggerConfirm(req.id, false)}
                          >
                            إلغاء التفعيل والتعطيل
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* الإشعارات العائمة */}
      {toastSuccess && (
        <div
          className="pwa-toast"
          style={{
            bottom: "auto",
            top: "20px",
            borderTop: "none",
            borderRight: "5px solid #01722c",
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
          }}
        >
          <FiCheckCircle size={18} color="#01722c" /> {toastSuccess}
        </div>
      )}

      {/* 🌟 نافذة تأكيد الإجراء المخصصة الفخمة للأذونات (بديلة عن window.confirm) 🌟 */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div
            className="confirm-card"
            style={{ borderTopColor: confirmApproved ? "#01722c" : "#ef4444" }}
          >
            <span
              className="confirm-icon"
              style={{ color: confirmApproved ? "#01722c" : "#ef4444" }}
            >
              {confirmApproved ? (
                <FiCheckCircle size={45} />
              ) : (
                <FiAlertTriangle size={45} />
              )}
            </span>
            <h3>تأكيد الإجراء الإداري</h3>
            <p>
              {confirmApproved
                ? "هل أنت متأكد تماماً من الموافقة على انضمام هذا المتجر؟ سيتم تفعيل حسابه فوراً ليتمكن من تسجيل الدخول والمشتريات."
                : "هل أنت متأكد تماماً من إجراء (الرفض والحذف) لهذا الحساب؟ سيتم إلغاء تفعيله وحذفه بالكامل من قاعدة البيانات."}
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-btn btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                تراجع
              </button>
              <button
                type="button"
                className="confirm-btn"
                style={{
                  backgroundColor: confirmApproved ? "#01722c" : "#ef4444",
                  color: "white",
                  boxShadow: confirmApproved
                    ? "0 4px 12px rgba(34, 197, 94, 0.2)"
                    : "0 4px 12px rgba(239, 68, 68, 0.2)",
                }}
                onClick={handleConfirmAction}
              >
                {confirmApproved ? "نعم، موافقة وتفعيل" : "نعم، رفض وحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Approvals;
