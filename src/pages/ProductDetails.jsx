// src/pages/ProductDetails.jsx
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

// التعديل الجديد: أضفنا FiHome و FiSearch و FiSettings في نهاية السطر
import {
  FiArrowLeft,
  FiShoppingCart,
  FiHeart,
  FiShoppingBag,
  FiCreditCard,
  FiHome,
  FiSearch,
  FiSettings,
} from "react-icons/fi";

import "./Home.css";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImageIndex] = useState(0);

  const { addToCart, cartCount, toast } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("فشل جلب تفاصيل المنتج", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const getOptimizedImage = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/w_1000,q_auto,f_auto/");
  };

  if (loading) {
    return (
      <div className="pwa-app-container">
        <div className="loader-container" style={{ paddingTop: "150px" }}>
          <div className="sleek-spinner"></div>
          <p>جاري تحميل تفاصيل السلعة...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="pwa-app-container"
        style={{ textAlign: "center", paddingTop: "100px" }}
      >
        <h3>عذراً، المنتج غير متوفر 🚫</h3>
        <Link
          to="/"
          className="pwa-hero-btn"
          style={{
            background: "#001f3f",
            color: "white",
            textDecoration: "none",
            display: "inline-block",
            marginTop: "15px",
          }}
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  // 🌟 فلتر ذكي: تقسيم الصور وطرد أي فراغات أو روابط معطوبة 🌟
  // استخدام الدالة الذكية هنا أيضاً
  const parseImages = (urlStr) => {
    if (!urlStr) return [];
    return urlStr
      .split(/(?=https?:\/\/)/)
      .map((img) => img.replace(/,+$/, "").trim())
      .filter(Boolean);
  };

  const images = parseImages(product.imageUrl);

  const handleBuyNow = () => {
    if (product.stock > 0) {
      addToCart(product);
      setTimeout(() => {
        navigate("/cart");
      }, 300);
    }
  };

  return (
    <div className="pwa-app-container">
      {/* 1. شريط علوي أنيق ومتجاوب مع اللابتوب */}
      <header className="pwa-top-bar">
        <Link to="/" className="pwa-logo">
          <span>N</span> المتجر
        </Link>
        {/* روابط اللابتوب المصححة بالكامل بأيقونات فيكتور فخمة وموحدة */}
        <div className="desktop-nav-links">
          <Link to="/" className="desktop-nav-link">
            <FiHome size={16} />
            <span>الرئيسية</span>
          </Link>
          <Link to="/explore" className="desktop-nav-link">
            <FiSearch size={16} />
            <span>استكشاف</span>
          </Link>

          {user && user.role === "ADMIN" && (
            <Link to="/admin/inventory" className="desktop-nav-link admin-link">
              <FiSettings size={16} />
              <span>لوحة الإدارة</span>
            </Link>
          )}
        </div>
        <Link to="/cart" className="pwa-cart-icon">
          <FiShoppingCart size={24} />
          {cartCount > 0 && <span className="pwa-cart-badge">{cartCount}</span>}
        </Link>
      </header>

      {/* 2. تفعيل التخطيط الجانبي المتجاوب الفخم هنا */}
      <main className="details-container">
        <div className="details-split-layout">
          {/* العمود الأيمن: سلايدر الصور بمقاس ملموم ومحمي */}
          <div className="details-image-section">
            <div className="product-slider-wrapper">
              {images.length > 0 ? (
                <img
                  src={getOptimizedImage(images[currentImgIndex])}
                  alt={product.name}
                />
              ) : (
                <FiShoppingBag size={80} color="#cbd5e1" />
              )}

              {images.length > 1 && (
                <div className="slider-dots">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`slider-dot ${idx === currentImgIndex ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* العمود الأيسر: كل التفاصيل والأزرار الملمومة معاً للابتوب */}
          <div className="details-info-section">
            <div className="details-header-row">
              <div className="details-title-box">
                <h2>{product.name}</h2>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: "bold",
                  }}
                >
                  القسم: {product.category?.name} - {product.section}
                </span>
              </div>
              <span className="details-price">${product.price}</span>
            </div>

            {/* تفضيل المنتج وحالة المخزن */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "20px 0",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "15px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: "bold",
                }}
              >
                حالة المخزن:{" "}
                <span
                  style={{
                    color: product.stock > 0 ? "#22c55e" : "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  {product.stock > 0
                    ? `متوفر  (${product.stock} قطع)`
                    : "نفذت الكمية"}
                </span>
              </span>
              <button
                className="pwa-fav-btn"
                onClick={() => toggleFavorite(product)}
                style={{ position: "relative", top: 0, right: 0 }}
              >
                <FiHeart
                  size={20}
                  fill={isFavorite(product.id) ? "#ef4444" : "none"}
                  color={isFavorite(product.id) ? "#ef4444" : "#94a3b8"}
                />
              </button>
            </div>

            {/* مواصفات المنتج */}
            <div style={{ marginTop: "20px" }}>
              <h4
                style={{
                  color: "#001f3f",
                  fontSize: "15px",
                  fontWeight: "800",
                  marginBottom: "10px",
                }}
              >
                مواصفات وتفاصيل المنتج
              </h4>
              <p
                className="long-description"
                style={{
                  fontSize: "14px",
                  color: "#475569",
                  lineHeight: "1.7",
                }}
              >
                {product.description}
              </p>
            </div>

            {/* 🌟 أزرار الشراء للديسكتوب (تظهر باللابتوب وتختفي بالموبايل) 🌟 */}
            <div className="details-desktop-action-buttons">
              {product.stock > 0 ? (
                <>
                  <button
                    className="btn-add-to-cart-outline"
                    onClick={() => addToCart(product)}
                  >
                    <FiShoppingCart size={16} /> أضف للسلة
                  </button>
                  <button className="btn-buy-now-solid" onClick={handleBuyNow}>
                    <FiCreditCard size={16} style={{ marginRight: "6px" }} />{" "}
                    شراء الآن
                  </button>
                </>
              ) : (
                <button
                  className="pwa-add-cart out-of-stock"
                  disabled
                  style={{ gridColumn: "span 2", padding: "12px" }}
                >
                  غير متوفر حالياً 🚫
                </button>
              )}
            </div>
          </div>{" "}
          {/* نهاية عمود التفاصيل */}
        </div>
      </main>

      {/* 🌟 أزرار الشراء الثابتة في الأسفل (تظهر بالموبايل وتختفي باللابتوب تماماً) 🌟 */}
      <div className="details-fixed-bottom-bar mobile-only">
        {product.stock > 0 ? (
          <>
            <button
              className="btn-add-to-cart-outline"
              onClick={() => addToCart(product)}
            >
              <FiShoppingCart size={16} /> أضف للسلة
            </button>
            <button className="btn-buy-now-solid" onClick={handleBuyNow}>
              <FiCreditCard size={16} style={{ marginRight: "6px" }} /> شراء
              الآن
            </button>
          </>
        ) : (
          <button
            className="pwa-add-cart out-of-stock"
            disabled
            style={{ gridColumn: "span 2", padding: "12px" }}
          >
            غير متوفر حالياً 🚫
          </button>
        )}
      </div>

      {toast && <div className="pwa-toast">{toast}</div>}
    </div>
  );
}

export default ProductDetails;
