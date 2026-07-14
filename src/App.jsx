import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import './App.css'
import Register from './pages/Register'
import NoPage from './pages/NoPage'
import AdminProductForm from './pages/AdminProductForm'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccssPage'
import ChatWidget from './pages/ChatWidget'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import ProductDetail from './pages/ProductDetail'

import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import Parent from './pages/Parent';

const Store = React.lazy(() => import('./pages/Store'))
const CartPage = React.lazy(() => import('./pages/CartPage'))
const MyOrders = React.lazy(() => import('./pages/MyOrders'))
const Categories = React.lazy(() => import('./pages/Categories'))
const AdminOrders = React.lazy(() => import('./pages/AdminOrders'))

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/store' element={<Store />}/>
        <Route path='/categories' element={<Categories />} />
        
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/order-success' element = {<OrderSuccessPage />}/>
        <Route path='/orders' element={<MyOrders />} />
        <Route path='/about' element={<AboutUs/>}/>
        <Route path='/contact' element={<ContactUs/>}/>
        <Route path='/product/:id' element={<ProductDetail />}/>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index         element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path='/admin/orders' element={<AdminOrders />} />
          <Route path='/admin/products/new' element={<AdminProductForm />} />
          <Route path='/admin/products/:id/edit' element={<AdminProductForm />} /> 
          <Route path='/admin/parent' element={<Parent />} /> 
        </Route>
        <Route path="*" element={<NoPage />} />
      </Routes>
      </Suspense>
      <ChatWidget /> 
    </Router>
  )
}

export default App

