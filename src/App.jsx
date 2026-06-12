// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Inventory from "./pages/admin/Inventory"; // استيراد صفحة المخزن الجديدة
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import { FavoritesProvider } from "./context/FavoritesContext";
import Orders from "./pages/admin/Orders";
import Dashboard from "./pages/admin/Dashboard";
import POS from "./pages/admin/POS";
import Customers from "./pages/admin/Customers";
import ProductDetails from "./pages/ProductDetails";
import Approvals from "./pages/admin/Approvals";
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          {" "}
          {/* تغليف المفضلات هنا */}
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/admin/inventory" element={<Inventory />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/pos" element={<POS />} />
              <Route path="/admin/customers" element={<Customers />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/admin/approvals" element={<Approvals />} />
            </Routes>
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
