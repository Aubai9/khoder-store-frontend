// src/pages/Explore.jsx
import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FavoritesContext } from "../context/FavoritesContext";
import API from "../services/api";

// استيراد الأيقونات الموحدة والفاخرة
import {
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiEdit2,
  FiHome,
  FiUser,
  FiSettings,
  FiStar,
} from "react-icons/fi";
import "./Home.css"; // للتنسيق الهيكلي
import "./Explore.css"; // لتنسيقات البحث والفلترة

function Explore() {
  const { user } = useContext(AuthContext);
  const { addToCart, cartCount, toast, cartPulse } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات البحث والفلترة
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL"); // ALL أو ID القسم
  const [selectedSection, setSelectedSection] = useState("ALL"); // ALL, رجالي, نسائي, ولادي

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await API.get("/products");
        setProducts(prodRes.data);

        const catRes = await API.get("/categories");
        setCategories(catRes.data);
      } catch (error) {
        console.error("خطأ أثناء جلب البيانات في الاستكشاف", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --------------------------------------------------
  // 1. دالة ذكية لفصل الصور بأمان وتفادي مشكلة الفواصل داخل روابط Cloudinary
  // --------------------------------------------------
  const parseImages = (urlStr) => {
    if (!urlStr) return [];
    // التقسيم بناءً على بداية الرابط http، ثم تنظيف الفواصل الزائدة
    return urlStr
      .split(/(?=https?:\/\/)/)
      .map((img) => img.replace(/,+$/, "").trim())
      .filter(Boolean);
  };

  // --------------------------------------------------
  // 2. دالة تحسين وضغط جودة الصورة للـ Retina تلقائياً عبر السحابة
  // --------------------------------------------------
  const getOptimizedImage = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/w_800,q_auto,f_auto/");
  };

  // --------------------------------------------------
  // 3. دالة توحيد وتصفية الحروف العربية (إزالة حساسية الهمزات والتاء المربوطة)
  // --------------------------------------------------
  const normalizeArabic = (text) => {
    if (!text) return "";
    return text
      .toString()
      .replace(/[أإآ]/g, "ا") // تحويل أ، إ، آ إلى ا
      .replace(/ة/g, "ه") // تحويل ة إلى ه
      .replace(/ى/g, "ي") // تحويل ى إلى ي
      .toLowerCase()
      .trim();
  };

  // --------------------------------------------------
  // 4. محرك البحث الشامل والذكي المطور (Universal Search)
  // --------------------------------------------------
  const filteredProducts = products.filter((product) => {
    const query = normalizeArabic(searchQuery);

    const matchesSearch =
      normalizeArabic(product.name).includes(query) ||
      normalizeArabic(product.description).includes(query) ||
      (product.sku && normalizeArabic(product.sku).includes(query)) ||
      (product.section && normalizeArabic(product.section).includes(query)) ||
      (product.category?.name &&
        normalizeArabic(product.category.name).includes(query));

    const matchesCategory =
      selectedCategory === "ALL" ||
      product.categoryId === parseInt(selectedCategory);
    const matchesSection =
      selectedSection === "ALL" || product.section === selectedSection;

    return matchesSearch && matchesCategory && matchesSection;
  });

  return (
    <div className="pwa-app-container">
      {/* 1. شريط علوي متجاوب واحترافي */}
      <header className="pwa-top-bar">
        <Link to="/" className="pwa-logo">
          <FiShoppingBag color="#ff6b00" size={24} />
          <span>متجر الـ PWA</span>
        </Link>

        {/* روابط اللابتوب */}
        <div className="desktop-nav-links">
          <Link to="/" className="desktop-nav-link">
            <FiHome size={16} />
            <span>الرئيسية</span>
          </Link>
          <Link to="/explore" className="desktop-nav-link active-page">
            <FiSearch size={16} />
            <span>استكشاف</span>
          </Link>

          {user && user.role === "ADMIN" ? (
            <Link to="/admin/inventory" className="desktop-nav-link admin-link">
              <FiSettings size={16} />
              <span>لوحة الإدارة</span>
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

      <main className="explore-container">
        {/* 2. صندوق البحث الذكي */}
        <div className="search-box-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="ابحث باسم المنتج، القسم، الفئة أو الـ SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="search-icon-inside" />
        </div>

        {/* 3. فلاتر التصفية السريعة (القسم الرئيسي) */}
        <h4 className="filter-group-title">القسم الرئيسي</h4>
        <div className="filter-scroll-row">
          <button
            className={`filter-pill ${selectedCategory === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedCategory("ALL")}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-pill ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 4. فلاتر التصفية السريعة (الفئات / التفرعات) */}
        <h4 className="filter-group-title">الفئة المستهدفة</h4>
        <div className="filter-scroll-row">
          <button
            className={`filter-pill ${selectedSection === "ALL" ? "active-orange" : ""}`}
            onClick={() => setSelectedSection("ALL")}
          >
            الكل
          </button>
          {["رجالي", "نسائي", "ولادي"].map((sec, idx) => (
            <button
              key={idx}
              className={`filter-pill ${selectedSection === sec ? "active-orange" : ""}`}
              onClick={() => setSelectedSection(sec)}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* 5. عرض النتائج والعداد */}
        <div className="results-count">
          تم العثور على {filteredProducts.length} منتج متوافق
        </div>

        {loading ? (
          <div className="loader-container" style={{ padding: "40px 20px" }}>
            <div className="sleek-spinner"></div>
            <p>جاري البحث في المخزن والسلع...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p
            style={{ textAlign: "center", color: "#64748b", marginTop: "50px" }}
          >
            عذراً، لم نجد أي نتائج تطابق بحثك الحالي
            <FiSearch size={"16px"} style={{ marginRight: "10px" }}></FiSearch>
          </p>
        ) : (
          /* تفعيل الماركر والمحاذاة التامة وتصفية الهوامش الجانبية للموبايل */
          <div
            className="pwa-products-grid"
            key={selectedCategory + selectedSection + searchQuery}
          >
            {filteredProducts.map((product) => {
              // فصل صور المنتج المتعددة بدقة
              const productImages = parseImages(product.imageUrl);

              return (
                <div
                  className="pwa-product-card"
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="pwa-product-img-wrapper">
                    {product.stock === 0 && (
                      <span className="out-of-stock-badge">نفدت الكمية 🚫</span>
                    )}

                    {user && user.role === "ADMIN" && (
                      <Link
                        to="/admin/inventory"
                        className="admin-quick-edit-btn"
                        title="تعديل سريع"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiEdit2 size={13} />
                      </Link>
                    )}

                    <button
                      className="pwa-fav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product);
                      }}
                    >
                      <FiHeart
                        size={16}
                        fill={isFavorite(product.id) ? "#ef4444" : "none"}
                        color={isFavorite(product.id) ? "#ef4444" : "#94a3b8"}
                      />
                    </button>

                    {/* السلايدر التفاعلي لصور الكرت */}
                    {productImages.length > 0 ? (
                      <>
                        <div className="card-slider-container">
                          {productImages.map((imgUrl, idx) => (
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
                        {productImages.length > 1 && (
                          <div className="swipe-indicator">اسحب ↔</div>
                        )}
                      </>
                    ) : (
                      <FiShoppingBag
                        size={40}
                        color="#cbd5e1"
                        className={
                          product.stock === 0 ? "img-out-of-stock" : ""
                        }
                      />
                    )}
                  </div>

                  <div className="pwa-product-details">
                    <div className="pwa-brand-rating">
                      <span>{product.section || "عام"}</span>
                    </div>

                    <div className="pwa-title-price-row">
                      <h4 className="pwa-product-title">{product.name}</h4>
                      <span className="pwa-current-price">
                        ${product.price}
                      </span>
                    </div>
                    <p className="pwa-product-desc">{product.description}</p>
                  </div>

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
        )}
      </main>

      {/* 6. شريط التنقل السفلي الثابت (Bottom Nav) */}
      <nav className="pwa-bottom-nav">
        <Link to="/" className="nav-item">
          <FiHome size={22} className="nav-icon" />
          <span>الرئيسية</span>
        </Link>
        <Link to="/explore" className="nav-item active">
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

      {toast && <div className="pwa-toast">{toast}</div>}
    </div>
  );
}

export default Explore;
