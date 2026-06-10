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

const Store = React.lazy(() => import('./pages/Store'))
const CartPage = React.lazy(() => import('./pages/CartPage'))
const AdminOrders = React.lazy(() => import('./pages/AdminOrders'))
const MyOrders = React.lazy(() => import('./pages/MyOrders'))
const Categories = React.lazy(() => import('./pages/Categories'))

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/store' element={<Store />}/>
        <Route path='/categories' element={<Categories />} />
        <Route path='/admin/products/new' element={<AdminProductForm />} />
        <Route path='/admin/products/:id/edit' element={<AdminProductForm />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/order-success' element = {<OrderSuccessPage />}/>
        <Route path='/admin/orders' element={<AdminOrders />} />
        <Route path='/orders' element={<MyOrders />} />
        <Route path='/about' element={<AboutUs/>}/>
        <Route path='/contact' element={<ContactUs/>}/>
        <Route path='/product/:id' element={<ProductDetail />}/>
        <Route path="*" element={<NoPage />} />
      </Routes>
      </Suspense>
      <ChatWidget /> 
    </Router>
  )
}

export default App

