// src/context/CartContext.jsx
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem("cart");
    return localData ? JSON.parse(localData) : [];
  });

  // حالتين جديدتين للأنيميشن والإشعار
  const [toast, setToast] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // دالة الإضافة المحدثة بالأنيميشن
  const addToCart = (product) => {
    setCart((prevCart) => {
      const exist = prevCart.find((item) => item.product.id === product.id);
      if (exist) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    // 1. تشغيل نبضة السلة فوراً
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 500); // إيقاف النبضة بعد نصف ثانية

    // 2. إظهار الإشعار المنبثق باسم المنتج
    setToast(`تم إضافة ${product.name} إلى السلة! 🛒`);

    // مسح الإشعار تلقائياً بعد ثانيتين ونصف بنعومة
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // دالة تعديل الكمية (تسمح بالوصول للصفر مؤقتاً أثناء مسح الرقم للكتابة)
  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  return (
    // أضفنا الـ toast والـ cartPulse لقائمة البيانات المصدرة
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        toast,
        cartPulse,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
