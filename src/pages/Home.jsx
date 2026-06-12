// src/pages/Home.jsx
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import API from "../services/api";
import "./Home.css";
import { FavoritesContext } from "../context/FavoritesContext";
import { TbShoe } from "react-icons/tb";
// استيراد الأيقونات الاحترافية
import {
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiHome,
  FiUser,
  FiSettings,
  FiStar,
  FiGrid,
  FiSmile,
  FiUsers,
  FiWind,
} from "react-icons/fi";
import { IoWomanOutline, IoManOutline } from "react-icons/io5";
import { PiBaby } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

function Home() {
  const [settings, setSettings] = useState({
    heroTitle: "جاري التحميل...",
    heroSubtitle: "",
    heroImageUrl: null,
  });
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { user } = useContext(AuthContext);
  const { addToCart, cartCount, toast, cartPulse } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const [activeFilter, setActiveFilter] = useState("الكل");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const settingsRes = await API.get("/admin/settings");
        setSettings(settingsRes.data);
        const response = await API.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("خطأ", error);
      }
    };
    fetchProducts();
  }, []);

  // --------------------------------------------------
  // محرك الفلترة الفوري للأقسام الدائرية
  // --------------------------------------------------

  const filteredProducts = products.filter((product) => {
    if (activeFilter === "الكل") return true;

    if (
      activeFilter === "رجالي" ||
      activeFilter === "نسائي" ||
      activeFilter === "ولادي"
    ) {
      return product.section === activeFilter;
    }

    if (activeFilter === "أحذية") {
      return product.category?.name === "أحذية";
    }

    // التعديل الجديد: عرض المنتجات المفضلة فقط!
    if (activeFilter === "المفضلة") {
      return isFavorite(product.id);
    }

    return true;
  });
  // الأقسام مع أيقوناتها الاحترافية
  // الأقسام الدائرية (تم تبديل 'عروض' بـ 'المفضلة')
  // 2. تحديث الأقسام لتستخدم حزمة Fi الموحدة حصراً
  const sections = [
    { name: "الكل", icon: <FiGrid size={24} /> },
    { name: "رجالي", icon: <IoManOutline size={24} /> },
    { name: "نسائي", icon: <IoWomanOutline size={24} /> },
    { name: "ولادي", icon: <PiBaby size={24} /> },
    { name: "أحذية", icon: <TbShoe size={24} /> }, // أيقونة تعبر عن الخفة/الرياضة
    { name: "المفضلة", icon: <FiHeart size={24} /> },
  ];

  // التعديل الضروري 2: دالة ذكية لتحسين جودة الصورة للـ Retina وضغط حجمها تلقائياً عبر Cloudinary
  const getOptimizedImage = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    // إضافة أوامر: جودة تلقائية، صيغة تلقائية، وعرض 800 بيكسل (لشاشات الريتينا)
    return url.replace("/upload/", "/upload/w_800,q_auto,f_auto/");
  };
  // 🌟 دالة ذكية لفصل الصور بأمان (تتجاهل الفواصل الموجودة داخل روابط Cloudinary) 🌟
  const parseImages = (urlStr) => {
    if (!urlStr) return [];
    // التقسيم بناءً على بداية الرابط http، ثم تنظيف الفواصل الزائدة
    return urlStr
      .split(/(?=https?:\/\/)/)
      .map((img) => img.replace(/,+$/, "").trim())
      .filter(Boolean);
  };

  return (
    <div className="pwa-app-container">
      {/* 1. الشريط العلوي */}
      {/* 1. الشريط العلوي مع روابط اللابتوب الذكية */}
      {/* 1. شريط التنقل العلوي الفخم والذكي */}
      <header className="pwa-top-bar">
        <Link to="/" className="pwa-logo">
          <FiShoppingBag color="#ff6b00" size={24} />
          <span>متجر الـ PWA</span>
        </Link>

        {/* روابط اللابتوب المحسنة بأيقونات SVG تفاعلية وبدون إيموجيز */}
        <div className="desktop-nav-links">
          <Link to="/" className="desktop-nav-link active-page">
            <FiHome size={16} />
            <span>الرئيسية</span>
          </Link>
          <Link to="/explore" className="desktop-nav-link">
            <FiSearch size={16} />
            <span>استكشاف</span>
          </Link>

          {user && user.role === "ADMIN" ? (
            <Link to="/admin/dashboard" className="desktop-nav-link admin-link">
              <FiSettings size={16} /> <span>لوحة الإدارة</span>
            </Link>
          ) : (
            <Link
              to={user ? "/profile" : "/login"}
              className="desktop-nav-link"
            >
              <FiUser size={16} />
              <span>{user ? "حسابي" : "تسجيل دخول"}</span>
            </Link>
          )}
        </div>

        {/* زر السلة الدائري المطور */}
        <Link
          to="/cart"
          className={`pwa-cart-icon-wrapper ${cartPulse ? "pulse" : ""}`}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="pwa-cart-badge">{cartCount}</span>
            )}
          </div>
        </Link>
      </header>

      {/* 2. البانر الإعلاني الديناميكي والمتحكم به من قبل المدير */}
      <section
        className={`pwa-hero ${settings.heroImageUrl ? "has-image" : ""}`}
        style={
          settings.heroImageUrl
            ? { backgroundImage: `url(${settings.heroImageUrl})` }
            : {}
        }
      >
        {/* الغطاء الشفاف يظهر فقط إذا كان هناك صورة لكي يبرز النص */}
        {settings.heroImageUrl && <div className="pwa-hero-overlay"></div>}

        <div className="pwa-hero-content">
          <h2>{settings.heroTitle}</h2>
          <div className="discount">{settings.heroSubtitle}</div>
          <button className="pwa-hero-btn" onClick={() => navigate("/explore")}>
            تسوق الآن
          </button>
        </div>

        {/* أيقونة الشعلة تظهر فقط إذا لم تكن هناك صورة */}
        {!settings.heroImageUrl && (
          <div className="pwa-hero-image">
            <FiStar size={80} color="rgba(255, 107, 0, 0.8)" />
          </div>
        )}
      </section>

      {/* 3. الأقسام الأفقية */}
      {/* ترويسة الأقسام المحدثة برابط فعال */}
      <div className="pwa-section-header">
        <h3>تسوق حسب القسم</h3>
        <Link to="/explore" className="pwa-see-all">
          عرض الكل
        </Link>
      </div>
      <div className="pwa-categories-scroll">
        {sections.map((sec, index) => (
          <div
            className={`pwa-category-item ${activeFilter === sec.name ? "active" : ""}`}
            key={index}
            onClick={() => setActiveFilter(sec.name)} // تفعيل الفلترة الفورية عند النقر!
          >
            <div className="pwa-cat-circle">{sec.icon}</div>
            <span className="pwa-cat-name">{sec.name}</span>
          </div>
        ))}
      </div>
      {/* 4. شبكة المنتجات (عمودين) */}
      {/* ترويسة المنتجات المحدثة برابط فعال */}
      <div className="pwa-section-header">
        <h3>اخترنا لك</h3>
        <Link to="/explore" className="pwa-see-all">
          عرض الكل
        </Link>
      </div>
      <div className="pwa-products-grid" key={activeFilter}>
        {filteredProducts.map((product) => {
          return (
            <div
              className="pwa-product-card"
              key={product.id}
              // عند الضغط على الكرت بالكامل ينضاف للسلة (بشرط توفر الكمية)
              onClick={() => navigate(`/product/${product.id}`)}
              style={{ cursor: product.stock > 0 ? "pointer" : "default" }}
            >
              <div className="pwa-product-img-wrapper">
                {product.stock === 0 && (
                  <span className="out-of-stock-badge">نفدت الكمية 🚫</span>
                )}

                <button
                  className="pwa-fav-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // 🌟 منع انتشار النقرة للأب (الكرت) لمنع الإضافة للسلة بالخطأ 🌟
                    toggleFavorite(product);
                  }}
                >
                  <FiHeart
                    size={16}
                    fill={isFavorite(product.id) ? "#ef4444" : "none"}
                    color={isFavorite(product.id) ? "#ef4444" : "#94a3b8"}
                  />
                </button>

                {/* 🌟 السلايدر التفاعلي الجديد داخل الكرت 🌟 */}
                {product.imageUrl ? (
                  <>
                    <div className="card-slider-container">
                      {parseImages(product.imageUrl).map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={getOptimizedImage(imgUrl)}
                          alt={`${product.name} - ${idx + 1}`}
                          className={
                            product.stock === 0 ? "img-out-of-stock" : ""
                          }
                          loading="lazy"
                        />
                      ))}
                    </div>
                    {/* إظهار مؤشر السحب إذا كان هناك أكثر من صورة */}
                    {parseImages(product.imageUrl).length > 1 && (
                      <div className="swipe-indicator">اسحب ↔</div>
                    )}
                  </>
                ) : (
                  <FiShoppingBag
                    size={40}
                    color="#cbd5e1"
                    className={product.stock === 0 ? "img-out-of-stock" : ""}
                  />
                )}
              </div>
              {/* الترتيب الجديد والنظيف للنصوص */}
              <div className="pwa-product-details">
                <div className="pwa-brand-rating">
                  <span>{product.section || "عام"}</span>
                </div>

                <div className="pwa-title-price-row">
                  <h4 className="pwa-product-title">{product.name}</h4>
                  <span className="pwa-current-price">${product.price}</span>
                </div>
                <p className="pwa-product-desc">{product.description}</p>
              </div>

              {/* الزر المطور مع الأيقونة */}
              {product.stock > 0 ? (
                <button
                  className="pwa-add-cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  <FiShoppingCart size={16} /> أضف للسلة
                </button>
              ) : (
                <button className="pwa-add-cart out-of-stock" disabled>
                  غير متوفر حالياً
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. شريط التنقل السفلي الثابت (Bottom Nav) */}
      <nav className="pwa-bottom-nav">
        <Link to="/" className="nav-item active">
          <FiHome size={22} className="nav-icon" />
          <span>الرئيسية</span>
        </Link>
        <Link to="/explore" className="nav-item">
          <FiSearch size={22} className="nav-icon" />
          <span>استكشاف</span>
        </Link>

        {user && user.role === "ADMIN" ? (
          <Link to="/admin/inventory" className="nav-item">
            <FiSettings size={22} className="nav-icon" />
            <span>الإدارة</span>
          </Link>
        ) : (
          <Link to={user ? "/profile" : "/login"} className="nav-item">
            <FiUser size={22} className="nav-icon" />
            <span>{user ? "حسابي" : "دخول"}</span>
          </Link>
        )}
      </nav>
      {/* عرض الإشعار العائم تلقائياً عند إضافة منتج */}
      {toast && <div className="pwa-toast">{toast}</div>}
    </div>
  );
}

export default Home;
