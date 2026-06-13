// src/pages/Cart.jsx
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FavoritesContext } from "../context/FavoritesContext";
import API from "../services/api";
import "./Cart.css";

import {
  FiArrowLeft,
  FiHeart,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiCheck,
  FiShoppingCart,
  FiCreditCard,
  FiAlertTriangle,
} from "react-icons/fi";

function Cart() {
  const { user, token } = useContext(AuthContext);

  // 🌟 الحل الجذري: نقلنا الـ navigate للأعلى لكي يستطيع الـ useEffect استخدامه 🌟
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const { cart, updateQuantity, removeFromCart, clearCart, cartCount } =
    useContext(CartContext);
  const { isFavorite } = useContext(FavoritesContext);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastError, setToastError] = useState("");

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [checkedItems, setCheckedItems] = useState(
    cart.reduce((acc, item) => ({ ...acc, [item.product.id]: true }), {}),
  );

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedTotal = cart.reduce((total, item) => {
    if (checkedItems[item.product.id]) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);

  const triggerErrorToast = (msg) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 4000);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("يجب تسجيل الدخول لإتمام عملية الشراء");
      return;
    }

    const selectedCartItems = cart.filter(
      (item) => checkedItems[item.product.id],
    );

    if (selectedCartItems.length === 0) {
      setError("الرجاء تحديد منتج واحد على الأقل لإتمام الشراء");
      return;
    }

    const orderItems = selectedCartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    setLoading(true);
    try {
      const response = await API.post("/orders", {
        address,
        phone,
        items: orderItems,
      });

      const newOrderId = response.data.order.id;

      const ADMIN_WHATSAPP_NUMBER = "963997008722";

      let message = ` - مرحبا أود تأكيد طلبي  -\n\n`;
      message += `رقم الطلبية : #${newOrderId}\n`;
      message += `اسم العميل : ${user.name}\n`;
      message += `عنوان التوصيل : ${address}\n`;
      message += ` تفاصيل المنتجات : \n`;

      selectedCartItems.forEach((item) => {
        message += `- ${item.product.name} (الكمية : ${item.quantity}) -> $${item.product.price}\n`;
      });

      message += `\n المجموع الإجمالي : $${selectedTotal.toFixed(2)}\n\n`;
      message += `شكراً لكم `;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      setSuccess("تم تسجيل طلبك وتوجيهك للواتساب بنجاح! 🎉");
      clearCart();
    } catch (err) {
      setError(err.response?.data?.error || "حدث خطأ أثناء معالجة طلبك");
    } finally {
      setLoading(false);
    }
  };

  const displayedCart = showFavoritesOnly
    ? cart.filter((item) => isFavorite(item.product.id))
    : cart;

  return (
    <div className="pwa-app-container">
      <div className="cart-pwa-container">
        <header className="cart-top-bar">
          <span className="cart-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={22} />
          </span>
          <h2 className="cart-top-title">سلة المشتريات</h2>

          <span
            className="cart-top-fav"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title="عرض مفضلاتي في السلة"
          >
            <FiHeart
              size={22}
              fill={showFavoritesOnly ? "#ef4444" : "none"}
              color={showFavoritesOnly ? "#ef4444" : "#94a3b8"}
              style={{ transition: "0.3s" }}
            />
          </span>
        </header>

        {success && (
          <div
            style={{
              backgroundColor: "#e6ffe6",
              color: "#008000",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {success}
          </div>
        )}
        {error && <div className="error-message">{error}</div>}

        {cart.length === 0 ? (
          <div className="empty-cart-wrapper">
            <div className="empty-cart-icon-box">
              <FiShoppingCart size={36} />
            </div>
            <h3>سلة مشترياتك فارغة حالياً</h3>
            <p>
              يبدو أنك لم تقم بإضافة أي منتجات إلى سلتك بعد. اكتشف أحدث العروض
              والسلع وابدأ بالتسوق الآن!
            </p>
            <Link to="/" className="empty-cart-btn">
              ابدأ التسوق الآن
            </Link>
          </div>
        ) : (
          <div className="cart-split-layout">
            <div className="cart-items-list">
              {displayedCart.map((item) => (
                <div className="cart-item-modern" key={item.product.id}>
                  <div
                    className="cart-item-img-box"
                    onClick={() => toggleCheck(item.product.id)}
                  >
                    <div
                      className={`cart-checkbox-wrapper ${checkedItems[item.product.id] ? "checked" : ""}`}
                    >
                      {checkedItems[item.product.id] && <FiCheck size={14} />}
                    </div>
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                      />
                    ) : (
                      <span style={{ fontSize: "40px" }}>📦</span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <div>
                      <h3>{item.product.name}</h3>
                      <span className="sub-info">
                        {item.product.section || "قسم عام"} - متوفر
                      </span>
                      <p className="price">${item.product.price}</p>
                    </div>

                    <div className="cart-controls-row">
                      <button
                        className="cart-trash-btn"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <FiTrash2 size={16} />
                      </button>

                      <div className="cart-qty-selector">
                        <button
                          className="qty-btn-minus"
                          onClick={() =>
                            item.quantity > 1 &&
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          style={{
                            opacity: item.quantity <= 1 ? 0.4 : 1,
                            cursor:
                              item.quantity <= 1 ? "not-allowed" : "pointer",
                            borderColor:
                              item.quantity <= 1 ? "#cbd5e1" : "#0f172a",
                          }}
                        >
                          <FiMinus size={14} />
                        </button>

                        <input
                          type="number"
                          className="qty-value-input"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              if (val > item.product.stock) {
                                triggerErrorToast(
                                  `عذراً، الكمية المتوفرة في المخزن هي ${item.product.stock} فقط`,
                                );
                                updateQuantity(
                                  item.product.id,
                                  item.product.stock,
                                );
                              } else {
                                updateQuantity(item.product.id, val);
                              }
                            } else {
                              updateQuantity(item.product.id, 0);
                            }
                          }}
                          onBlur={() => {
                            if (item.quantity <= 0) {
                              updateQuantity(item.product.id, 1);
                            }
                          }}
                          min="1"
                        />

                        <button
                          className="qty-btn-plus"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-card">
              <h3>
                <u>الفاتورة</u>
              </h3>
              <div className="cart-summary-row">
                <span>المجموع الكلي:</span>
                <span style={{ color: "#ff6b00" }}>
                  ${selectedTotal.toFixed(2)}
                </span>
              </div>

              {user ? (
                <form onSubmit={handleCheckout}>
                  <div className="form-group">
                    <label>عنوان التوصيل بالتفصيل</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      style={{ background: "#f8fafc", borderRadius: "8px" }}
                    />
                  </div>
                  <div className="form-group">
                    <label>رقم الهاتف للتواصل</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="09xxxxxxxx"
                      style={{ background: "#f8fafc", borderRadius: "8px" }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cart-checkout-btn"
                  >
                    {loading ? (
                      "جاري إرسال الطلب..."
                    ) : (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <FiCreditCard size={18} /> تأكيد وإتمام الشراء
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginBottom: "15px",
                    }}
                  >
                    يرجى تسجيل الدخول لتتمكن من إتمام عملية الشراء
                  </p>
                  <Link
                    to="/login"
                    className="pwa-hero-btn"
                    style={{
                      display: "block",
                      background: "#001f3f",
                      color: "white",
                      textAlign: "center",
                      textDecoration: "none",
                      padding: "10px 0",
                      borderRadius: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toastError && (
        <div className="pwa-toast pwa-toast-error">
          <FiAlertTriangle size={18} /> {toastError}
        </div>
      )}
    </div>
  );
}

export default Cart;
