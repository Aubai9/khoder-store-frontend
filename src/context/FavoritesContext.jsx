// src/context/FavoritesContext.jsx
import { createContext, useState, useEffect } from "react";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  // جلب المفضلات المخزنة في المتصفح إن وجدت عند بدء التطبيق
  const [favorites, setFavorites] = useState(() => {
    const localData = localStorage.getItem("favorites");
    return localData ? JSON.parse(localData) : [];
  });

  // حفظ المفضلات في المتصفح تلقائياً كلما تغيرت محتوياتها
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // دالة ذكية لإضافة أو حذف المنتج (Toggle) عند النقر على القلب
  const toggleFavorite = (product) => {
    setFavorites((prevFavs) => {
      const exists = prevFavs.find((item) => item.id === product.id);
      if (exists) {
        // إذا كان موجوداً مسبقاً، نحذفه (إزالة التفضيل)
        return prevFavs.filter((item) => item.id !== product.id);
      }
      // إذا لم يكن موجوداً، نضيفه
      return [...prevFavs, product];
    });
  };

  // دالة لفحص هل المنتج مفضل حالياً أم لا (لتلوين القلب باللون الأحمر)
  const isFavorite = (productId) => {
    return favorites.some((item) => item.id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
