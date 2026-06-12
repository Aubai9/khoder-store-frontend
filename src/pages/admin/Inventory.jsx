// src/pages/admin/Inventory.jsx
import { useEffect, useState, useContext } from "react"; // أضفنا useContext
import { useNavigate } from "react-router-dom"; // أضفنا التوجيه
import { AuthContext } from "../../context/AuthContext"; // جلبنا بيانات المستخدم
import API from "../../services/api";
import "./Inventory.css";
import { Link } from "react-router-dom"; // لربط صفحة الطلبات الجديدة
import {
  FiGrid,
  FiBox,
  FiMonitor,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiHome,
  FiMenu,
  FiKey,
} from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

function Inventory() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات النافذة المنبثقة (Modal)
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [productIdToEdit, setProductIdToEdit] = useState(null);

  // حالات فورم الإضافة والتعديل
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // حالات نافذة تأكيد الحذف المخصصة
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);

  const [imageUrl, setImageUrl] = useState(""); // لتخزين رابط الصورة السحابي
  const [uploading, setUploading] = useState(false); // لإظهار مؤشر "جاري الرفع"

  const [section, setSection] = useState("رجالي"); // التفرع الافتراضي
  const [sku, setSku] = useState("");
  const [showDropdown, setShowDropdown] = useState(false); // كود تفعيل الدروب داون
  // 1. جلب البيانات من السيرفر
  const fetchData = async () => {
    try {
      const prodRes = await API.get("/products");
      setProducts(prodRes.data);

      const catRes = await API.get("/categories");
      setCategories(catRes.data);
    } catch (error) {
      console.error("خطأ أثناء جلب بيانات المخزن", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // دالة رفع الصورة إلى Cloudinary والحصول على الرابط السحابي
  // دالة رفع الصورة السحابية باستخدام متغيرات البيئة الآمنة .env
  // دالة رفع صور متعددة في نفس اللحظة
  // دالة الرفع المطورة والمحمية
  // دالة الرفع المباشرة والمضمونة 100% بدون أي مشاكل تعريف
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        );

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        return fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        ).then((res) => res.json());
      });

      const results = await Promise.all(uploadPromises);

      // جلب روابط الصور المرفوعة حديثاً
      const newUrls = results.map((data) => data.secure_url).filter(Boolean);

      // 🌟 التعديل الخارق: نستخدم الـ State المباشر `imageUrl` لقراءة الصور القديمة 🌟
      const prevArray = parseImages(imageUrl);

      // دمج الصور القديمة مع الجديدة وحفظها مباشرة
      setImageUrl([...prevArray, ...newUrls].join(","));
    } catch (err) {
      alert("فشل رفع الصور، يرجى المحاولة مجدداً");
    } finally {
      setUploading(false);
    }
  };
  // دالة لحذف صورة واحدة فقط من معرض صور المنتج
  // دالة الحذف المطورة والمحمية
  const removeSpecificImage = (indexToRemove) => {
    // تنظيف المصفوفة أولاً ثم الحذف ثم الدمج
    const currentImages = parseImages(imageUrl);
    const updatedImages = currentImages.filter(
      (_, idx) => idx !== indexToRemove,
    );
    setImageUrl(updatedImages.join(" "));
  };

  // 2. دالة حفظ المنتج (إضافة أو تعديل)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl,
        section: section,
        sku: sku, // إرسال الرمز المخصص للباك إند
      };
      if (editMode) {
        // تعديل منتج موجود
        await API.put(`/products/${productIdToEdit}`, productData);
      } else {
        // إضافة منتج جديد
        await API.post("/products", productData);
      }

      fetchData(); // تحديث الجدول فوراً
      closeModal();
    } catch (error) {
      alert(error.response?.data?.error || "فشلت العملية");
    }
  };

  // دالة تفتح نافذة التأكيد وتخزن رقم المنتج المراد حذفه
  const triggerDeleteConfirm = (id) => {
    setProductIdToDelete(id);
    setShowDeleteConfirm(true);
  };

  // دالة الحذف الفعلية التي تعمل بعد ضغط الزر الأحمر في النافذة الجديدة
  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/products/${productIdToDelete}`);
      fetchData(); // تحديث الجدول
      setShowDeleteConfirm(false); // إغلاق النافذة
    } catch (error) {
      alert(error.response?.data?.error || "حدث خطأ غير متوقع");
    }
  };

  // فتح المودال للإضافة
  const openAddModal = () => {
    setEditMode(false);
    setName("");
    setPrice("");
    setStock("");
    setDescription("");
    setImageUrl(""); // تصفير الصورة للمنتج الجديد
    setCategoryId(categories[0]?.id || "");
    setSection("رجالي");
    setSku("");
    setShowModal(true);
  };

  // فتح المودال للتعديل ببيانات المنتج المحدد
  const openEditModal = (product) => {
    setEditMode(true);
    setProductIdToEdit(product.id);
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
    setDescription(product.description);
    setCategoryId(product.categoryId);
    setImageUrl(product.imageUrl || ""); // عرض الصورة الحالية للمنتج عند التعديل
    setSection(product.section || "رجالي");
    setSku(product.sku || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const parseImages = (urlStr) => {
    if (!urlStr) return [];
    return urlStr
      .split(/(?=https?:\/\/)/)
      .map((img) => img.replace(/,+$/, "").trim())
      .filter(Boolean);
  };
  return (
    <div className="admin-layout">
      {/* القسم الأيمن: الشريط الجانبي الفخم */}
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
            {user?.name || "المدير"}
          </p>
        </div>

        <div className="sidebar-menu">
          <Link to="/admin/dashboard" className="menu-item">
            <FiGrid size={18} /> لوحة التحكم
          </Link>
          <div className="menu-item active">
            <FiBox size={18} /> المخزون
          </div>
          <Link to="/admin/orders" className="menu-item">
            <FiFileText size={18} /> الطلبات
          </Link>
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

        {/* القسم السفلي: العودة للمتجر وتسجيل الخروج */}
        {/* التعديل الجديد والمطور: يدعم اللابتوب كأزرار ثابتة، والجوال كقائمة منسدلة Dropdown */}
        <div className="sidebar-footer-wrapper">
          {/* 1. نسخة اللابتوب والكمبيوتر (أزرار ثابتة وأنيقة بالأسفل) */}
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

          {/* 2. نسخة الجوال والتابلت (تختفي الأزرار ويظهر زر قائمة منسدلة Dropdown فخم باليسار) */}
          <div className="sidebar-footer-mobile">
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FiMenu size={24} />
            </button>

            {/* القائمة المنسدلة للخيارات في الجوال */}
            {/* القائمة المنسدلة الشاملة لكل خيارات الإدارة في الجوال */}
            {/* القائمة المنسدلة المحدثة بالكامل مع ميزة الإغلاق الذكي عند النقر بالخارج أو على العنصر النشط */}
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

                  {/* الخيار النشط هنا هو المخزون */}
                  <div
                    className="dropdown-item active-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiBox size={16} /> المخزون
                  </div>

                  <Link
                    to="/admin/orders"
                    className="dropdown-item"
                    style={{ textDecoration: "none", color: "#475569" }}
                    onClick={() => setShowDropdown(false)}
                  >
                    <FiFileText size={16} /> الطلبات
                  </Link>

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

      {/* القسم الأيسر: جدول المخزون وإدارة البضائع */}
      <main className="inventory-content">
        <div className="inventory-header">
          <h1>إدارة المخزون والسلع</h1>
          <button className="add-product-btn" onClick={openAddModal}>
            <FiPlus size={16} style={{ marginRight: "5px" }} /> إضافة منتج جديد
          </button>
        </div>

        {loading ? (
          <p>جاري تحميل المخزن...</p>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>رقم السلعة</th>
                  <th>اسم المنتج</th>
                  <th>القسم</th>
                  <th>الفئة</th>
                  <th>السعر</th>
                  <th>الكمية المتوفرة</th>
                  <th>حالة المخزن</th>
                  <th>العمليات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.sku ? `#${product.sku}` : `#${product.id}`}
                    </td>
                    <td style={{ fontWeight: "bold", color: "#001f3f" }}>
                      {product.name}
                    </td>
                    <td>{product.category?.name || "غير محدد"}</td>
                    <td>{product.section || "غير محدد"}</td>
                    <td style={{ fontWeight: "bold" }}>${product.price}</td>
                    <td>{product.stock} قطع</td>
                    <td>
                      {product.stock > 10 ? (
                        <span className="stock-badge stock-ok">
                          متوفر ممتاز
                        </span>
                      ) : product.stock > 0 ? (
                        <span className="stock-badge stock-warning">
                          كمية منخفضة
                        </span>
                      ) : (
                        <span className="stock-badge stock-out">
                          نفذت الكمية
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="action-btn btn-edit"
                        onClick={() => openEditModal(product)}
                      >
                        تعديل
                      </button>
                      <br></br>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => triggerDeleteConfirm(product.id)}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* نافذة الإضافة والتعديل (Modal) */}
      {/* نافذة الإضافة والتعديل (Modal) المطورة بالكامل لتصبح ملمومة وغاية في الأناقة */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSaveProduct}>
            <h2 className="modal-header">
              {editMode
                ? "⚙️ تعديل بيانات السلعة"
                : "📦 إضافة سلعة جديدة للمخزن"}
            </h2>

            {/* الصف الأول: رمز السلعة المخصص + اسم المنتج (جنب بعض) */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label>رمز السلعة المخصص (SKU / اختياري)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="مثال: SHOE-104 أو 1002"
                />
              </div>
              <div className="form-group">
                <label>اسم المنتج</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="اكتب اسم المنتج هنا"
                />
              </div>
            </div>

            {/* الصف الثاني: السعر + الكمية في المخزن (جنب بعض) */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label>السعر ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>الكمية في المخزن</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  placeholder="مثال: 50"
                />
              </div>
            </div>

            {/* الصف الثالث: القسم الرئيسي + التفرع (جنب بعض) */}
            <div className="modal-grid-2">
              <div className="form-group">
                <label>القسم الرئيسي</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>الفئة (التفرع)</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                >
                  <option value="رجالي">رجالي</option>
                  <option value="نسائي">نسائي</option>
                  <option value="ولادي">ولادي</option>
                </select>
              </div>
            </div>

            {/* الصف الرابع: صورة المنتج (تأخذ العرض بالكامل) */}
            <div className="form-group">
              <label>صور المنتج</label>
              {/* الصف الرابع: صورة أو صور المنتج */}
              <div className="form-group">
                <label
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>صور المنتج (يمكنك تحديد عدة صور معاً)</span>
                  {/* زر لمسح الصور إذا أراد المدير تغييرها */}
                  {imageUrl && (
                    <span
                      onClick={() => setImageUrl("")}
                      style={{
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      🗑️ مسح الصور
                    </span>
                  )}
                </label>

                <div
                  className="modal-image-upload"
                  style={{ flexDirection: "column", alignItems: "stretch" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple /* 🌟 هذا السطر يسمح للمدير بتحديد أكثر من صورة 🌟 */
                    onChange={handleImageUpload}
                    id="file-upload"
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="upload-label-btn"
                    style={{ margin: 0, textAlign: "center" }}
                  >
                    {uploading
                      ? "⏳ جاري الرفع للسحابة..."
                      : "📁 اضغط هنا لاختيار صور السلعة"}
                  </label>

                  {/* عرض الصور المصغرة المتعددة */}
                  {/* عرض الصور المصغرة المتعددة مع زر حذف لكل صورة بشكل ديناميكي */}
                  {imageUrl && (
                    <div className="multi-image-preview-container">
                      {parseImages(imageUrl).map((img, idx) => (
                        <div className="preview-img-wrapper" key={idx}>
                          <img src={img} alt={`preview-${idx}`} />
                          {/* زر حذف هذه الصورة تحديداً */}
                          <button
                            type="button"
                            className="remove-single-img-btn"
                            onClick={() => removeSpecificImage(idx)}
                            title="حذف هذه الصورة"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* الصف الخامس: الوصف (يأخذ العرض بالكامل) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>الوصف بالتفصيل</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="اكتب مواصفات السلعة بالتفصيل هنا..."
                style={{ minHeight: "80px", resize: "vertical" }}
              />
            </div>

            {/* أزرار الحفظ والإلغاء المنسقة والملونة بالأسفل */}
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={closeModal}
              >
                إلغاء
              </button>
              <button type="submit" className="modal-btn modal-btn-save">
                حفظ السلعة
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <span className="confirm-icon">
              <FiAlertTriangle size={45} />
            </span>
            <h3>تأكيد عملية الحذف</h3>
            <p>
              هل أنت متأكد تماماً من حذف هذا المنتج من المخزن؟ هذه العملية لا
              يمكن التراجع عنها أبداً.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-btn btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                إلغاء الأمر
              </button>
              <button
                type="button"
                className="confirm-btn btn-danger-confirm"
                onClick={handleConfirmDelete}
              >
                نعم، احذف المنتج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
