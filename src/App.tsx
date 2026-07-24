import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTheme } from './context/useTheme';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import './App.css';
import Register from './pages/Register';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccssPage';
import ChatWidget from './pages/ChatWidget';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ProductDetail from './pages/ProductDetail';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';

// Lazy-loaded pages
const Store         = React.lazy(() => import('./pages/Store'));
const CartPage      = React.lazy(() => import('./pages/CartPage'));
const MyOrders      = React.lazy(() => import('./pages/MyOrders'));
const Categories    = React.lazy(() => import('./pages/Categories'));
const AdminOrders   = React.lazy(() => import('./pages/AdminOrders'));
const AdminProductForm = React.lazy(() => import('./pages/AdminProductForm'));
const NoPage        = React.lazy(() => import('./pages/NoPage'));

function App() {
  const { theme } = useTheme();

  return (
    <Router>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen text-gray-400">
          Loading...
        </div>
      }>
        <div className={theme}>
          <Routes>
            {/* Public routes */}
            <Route path="/"              element={<HomePage />}       />
            <Route path="/login"         element={<Login />}          />
            <Route path="/register"      element={<Register />}       />
            <Route path="/store"         element={<Store />}          />
            <Route path="/categories"    element={<Categories />}     />
            <Route path="/cart"          element={<CartPage />}       />
            <Route path="/checkout"      element={<CheckoutPage />}   />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/orders"        element={<MyOrders />}       />
            <Route path="/about"         element={<AboutUs />}        />
            <Route path="/contact"       element={<ContactUs />}      />
            <Route path="/product/:id"   element={<ProductDetail />}  />

            {/* Admin SPA */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index                         element={<AdminDashboard />}   />
              <Route path="orders"                 element={<AdminOrders />}      />
              <Route path="products/new"           element={<AdminProductForm />} />
              <Route path="products/:id/edit"      element={<AdminProductForm />} />
            </Route>

            <Route path="*" element={<NoPage />} />
          </Routes>
        </div>
      </Suspense>
      <ChatWidget />
    </Router>
  );
}

export default App;
