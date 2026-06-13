// src/pages/admin/Customers.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

// استيراد كافة الأيقونات الموحدة والاحترافية
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
  FiAlertTriangle,
  FiSmartphone,
  FiUser,
  FiPlus,
} from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

import "./Inventory.css";

function Customers() {
  const { user, logoutUser } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // حالات نافذة دفتر العميل (Ledger)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [transactionType, setTransactionType] = useState("PAYMENT"); // الحالة الافتراضية سداد
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // حالات نافذة إضافة عميل جديد
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerUsername, setNewCustomerUsername] = useState("");
  const [newCustomerWhatsapp, setNewCustomerWhatsapp] = useState("");
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

  // حالات تعيين باسوورد جديد للعميل
  const [newPasswordState, setNewPasswordState] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // حالات الإشعارات العائمة الفخمة (Toasts)
  const [toastSuccess, setToastSuccess] = useState("");
  const [toastError, setToastError] = useState("");

  const triggerSuccess = (msg) => {
    setToastSuccess(msg);
    setTimeout(() => setToastSuccess(""), 5000);
  };

  const triggerError = (msg) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 5000);
  };

  // دالة لتنظيف وتنسيق رقم الواتساب الدولي لسوريا تلقائياً [1]
  const formatWhatsAppNumber = (phoneStr) => {
    if (!phoneStr) return "";
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("00")) cleaned = cleaned.substring(2);
    if (cleaned.startsWith("09") && cleaned.length === 10) {
      cleaned = "963" + cleaned.substring(1);
    } else if (cleaned.startsWith("9") && cleaned.length === 9) {
      cleaned = "963" + cleaned;
    }
    return cleaned;
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/admin/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("فشل جلب بيانات العملاء", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // دالة تسجيل دفعة السداد أو إضافة دين
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmittingPayment(true);
    try {
      await API.post("/admin/payment", {
        customerId: selectedCustomer.id,
        amount: paymentAmount,
        notes: paymentNotes,
        type: transactionType, // إرسال نوع العملية
      });
      triggerSuccess("تم تسجيل العملية المحاسبية وتحديث رصيد العميل! ✅");
      setSelectedCustomer(null);
      setPaymentAmount("");
      setPaymentNotes("");
      setTransactionType("PAYMENT");
      fetchCustomers();
    } catch (error) {
      triggerError(error.response?.data?.error || "فشل تسجيل العملية");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // دالة تسجيل عميل جديد
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    setSubmittingCustomer(true);
    try {
      await API.post("/users/register", {
        name: newCustomerName,
        username: newCustomerUsername,
        whatsapp: newCustomerWhatsapp,
        password: "123",
      });

      triggerSuccess(
        `تم تسجيل العميل الجديد بنجاح! الباسوورد الافتراضي: 123 🎉`,
      );
      setShowAddModal(false);
      setNewCustomerName("");
      setNewCustomerUsername("");
      setNewCustomerWhatsapp("");
      fetchCustomers();
    } catch (error) {
      triggerError(error.response?.data?.error || "فشل تسجيل العميل الجديد");
    } finally {
      setSubmittingCustomer(false);
    }
  };

  // دالة تغيير باسوورد العميل
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPasswordState) return;
    setUpdatingPassword(true);
    try {
      await API.put("/admin/reset-password", {
        customerId: selectedCustomer.id,
        newPassword: newPasswordState,
      });
      triggerSuccess("تم تحديث كلمة المرور للعميل بنجاح! 🔐✅");
      setNewPasswordState("");
      setSelectedCustomer(null);
    } catch (error) {
      triggerError(error.response?.data?.error || "فشل تحديث كلمة المرور");
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* القائمة الجانبية */}
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
            style={{ textDecoration: "none" }}
          >
            <FiGrid size={18} /> لوحة التحكم
          </Link>
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
          <div className="menu-item active">
            <FiUsers size={18} /> العملاء والديون
          </div>
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
                  <div
                    className="dropdown-item active-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiUsers size={16} /> العملاء والديون
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
                  <div
                    onClick={() => {
                      logoutUser();
                      navigate("/login");
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

      {/* محتوى الشاشة الأيسر */}
      <main className="inventory-content">
        <div className="inventory-header">
          <h1>إدارة العملاء والديون 👥</h1>
          <button
            className="add-product-btn"
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: "#ff6b00",
              boxShadow: "0 4px 12px rgba(255, 107, 0, 0.2)",
            }}
          >
            <FiPlus size={16} style={{ marginRight: "5px" }} /> إضافة عميل جديد
          </button>
        </div>

        {loading ? (
          <p>جاري تحميل قائمة العملاء...</p>
        ) : customers.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            لا يوجد عملاء مسجلين حتى الآن.
          </p>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>اسم المتجر (العميل)</th>
                  <th>رقم الواتساب</th>
                  <th>عدد الطلبات</th>
                  <th>إجمالي المسحوبات (الكلي)</th>
                  <th>إجمالي المدفوعات (المدفوع)</th>
                  <th style={{ color: "#ef4444" }}>الرصيد المتبقي (الباقي)</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const hasDebt = customer.totalDebt > 0;
                  return (
                    <tr
                      key={customer.id}
                      className="clickable-row"
                      onClick={() => setSelectedCustomer(customer)}
                      title="انقر لعرض دفتر العميل وتسجيل دفعة"
                    >
                      <td
                        style={{
                          fontWeight: "bold",
                          color: "#001f3f",
                          fontSize: "15px",
                        }}
                      >
                        {customer.username}
                      </td>
                      <td dir="ltr" style={{ textAlign: "right" }}>
                        {/* استخدام دالة التنظيف التلقائي الذكية للواتس */}
                        <a
                          href={`https://api.whatsapp.com/send?phone=${formatWhatsAppNumber(customer.whatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: "#22c55e",
                            textDecoration: "none",
                            fontWeight: "bold",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          title="اضغط لمراسلة العميل فوراً على الواتساب"
                        >
                          <FiSmartphone /> {customer.whatsapp}
                        </a>
                      </td>
                      <td>
                        <span
                          style={{
                            background: "#f1f5f9",
                            padding: "4px 8px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                          }}
                        >
                          {customer.orderCount}
                        </span>
                      </td>
                      <td style={{ fontWeight: "900", color: "#001f3f" }}>
                        ${customer.totalPurchases.toFixed(2)}
                      </td>
                      <td style={{ fontWeight: "bold", color: "#22c55e" }}>
                        ${customer.totalPaid.toFixed(2)}
                      </td>
                      <td>
                        <span
                          style={{
                            color: hasDebt ? "#ef4444" : "#64748b",
                            backgroundColor: hasDebt ? "#fef2f2" : "#f8fafc",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontWeight: "900",
                            display: "inline-block",
                            border: hasDebt
                              ? "1px solid #fecaca"
                              : "1px solid #e2e8f0",
                          }}
                        >
                          ${customer.totalDebt.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                textAlign: "center",
                margin: "10px 0",
              }}
            >
              💡 اضغط على اسم العميل لفتح دفتره وتسجيل الدفعات.
            </p>
          </div>
        )}
      </main>

      {/* 3. نافذة دفتر العميل (Ledger Modal) */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-header">
              دفتر الصندوق: {selectedCustomer.username}
            </h2>

            <div className="ledger-history-box">
              <h4>
                <FiClock size={16} /> آخر حركات العميل
              </h4>
              {selectedCustomer.orders.length === 0 ? (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    textAlign: "center",
                  }}
                >
                  لا توجد حركات سابقة.
                </p>
              ) : (
                selectedCustomer.orders.slice(0, 5).map((order) => {
                  const orderDate = new Date(
                    order.createdAt,
                  ).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  });
                  const isPayment =
                    order.totalPrice === 0 && order.paidAmount > 0;

                  return (
                    <div className="ledger-history-item" key={order.id}>
                      <div className="ledger-item-details">
                        <span className="ledger-item-name">
                          {isPayment
                            ? "سداد دفعة نقدية"
                            : order.orderItems[0]?.product?.name ||
                              "مشتريات متنوعة"}
                        </span>
                        <span className="ledger-item-type">
                          {orderDate} -{" "}
                          {isPayment ? "دفع من العميل" : "مسحوبات"}
                        </span>
                      </div>
                      <span
                        className={`ledger-item-amount ${isPayment ? "amount-payment" : "amount-purchase"}`}
                      >
                        {isPayment
                          ? `+ $${order.paidAmount}`
                          : `- $${order.totalPrice}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>نوع العملية</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    fontWeight: "bold",
                    color:
                      transactionType === "PAYMENT" ? "#15803d" : "#b91c1c",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="PAYMENT">
                    دفع من العميل (تنزيل من الدين) ⬇️
                  </option>
                  <option value="DEBT">إضافة دين (تسجيل على الحساب) ⬆️</option>
                </select>
              </div>

              <div className="form-group">
                <label>المبلغ ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color:
                      transactionType === "PAYMENT" ? "#22c55e" : "#ef4444",
                  }}
                />
              </div>

              <div className="form-group">
                <label>ملاحظات البيان (اختياري)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="أضف ملاحظات (مثال: حوالة هرم، نقداً...)"
                />
              </div>

              <div
                className="modal-footer"
                style={{ marginTop: "15px", paddingOver: 0, border: "none" }}
              >
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={() => setSelectedCustomer(null)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="modal-btn modal-btn-save"
                  style={{ backgroundColor: "#22c55e", color: "white" }}
                >
                  {submittingPayment ? "جاري التسجيل..." : "تسجيل العملية ✅"}
                </button>
              </div>
            </form>

            {/* قسم تغيير باسوورد العميل المنسق والآمن */}
            <div
              style={{
                marginTop: "25px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "20px",
              }}
            >
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "13px",
                  color: "#475569",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                🔐 تعيين كلمة مرور جديدة وقوية للعميل
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={newPasswordState}
                  onChange={(e) => setNewPasswordState(e.target.value)}
                  placeholder="اكتب كلمة مرور جديدة هنا (أرقام وحروف)"
                  style={{
                    flexGrow: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
                <button
                  type="button"
                  disabled={updatingPassword}
                  className="action-btn btn-edit"
                  onClick={handleResetPasswordSubmit}
                  style={{
                    whiteSpace: "nowrap",
                    padding: "0 15px",
                    borderRadius: "8px",
                    margin: 0,
                  }}
                >
                  {updatingPassword ? "جاري التحديث..." : "تحديث الباسوورد"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. نافذة إضافة عميل جديد */}
      {showAddModal && (
        <div className="modal-overlay">
          <form
            className="modal-content"
            onSubmit={handleAddCustomerSubmit}
            style={{ borderTopColor: "#ff6b00" }}
          >
            <h2 className="modal-header">تسجيل عميل (متجر) جديد للمحل</h2>

            <div className="form-group">
              <label>اسم الشخص المسؤول (المدير)</label>
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                required
                placeholder="مثال: أحمد علي"
              />
            </div>

            <div className="form-group">
              <label>اسم المتجر (يُسخدم للبحث والـ Login)</label>
              <input
                type="text"
                value={newCustomerUsername}
                onChange={(e) => setNewCustomerUsername(e.target.value)}
                required
                placeholder="مثال: متجر_أحمد"
              />
            </div>

            <div className="form-group">
              <label>رقم الواتساب للعميل</label>
              <input
                type="tel"
                value={newCustomerWhatsapp}
                onChange={(e) => setNewCustomerWhatsapp(e.target.value)}
                required
                placeholder="مثال: 09xxxxxxxx"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label>كلمة المرور الافتراضية للعميل (لحساباته المستقبلية)</label>
              <input
                type="text"
                value="123"
                disabled
                style={{
                  background: "#f1f5f9",
                  fontWeight: "bold",
                  color: "#64748b",
                }}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submittingCustomer}
                className="modal-btn modal-btn-save"
                style={{
                  backgroundColor: "#ff6b00",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(255, 107, 0, 0.2)",
                }}
              >
                {submittingCustomer
                  ? "جاري الحفظ..."
                  : "تسجيل العميل الجديد ✅"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* الإشعارات العائمة */}
      {toastSuccess && (
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
          <FiCheckCircle size={18} color="#22c55e" /> {toastSuccess}
        </div>
      )}

      {toastError && (
        <div className="pwa-toast pwa-toast-error">
          <FiAlertTriangle size={18} /> {toastError}
        </div>
      )}
    </div>
  );
}

export default Customers;
