// /client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AdminOrderDetails from './pages/AdminOrderDetails';
import AdminDashboard from './pages/AdminDashboard';
import ProductPage from './pages/ProductPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Cart synchronization function
  const syncCartWithServer = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const { data } = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formattedCart = data.map(item => ({
        product: {
          _id: item.product?._id,
          name: item.product?.name,
          price: item.product?.price,
          image: item.product?.image,
          stock: item.product?.stock
        },
        quantity: item.quantity
      }));
      
      setCartItems(formattedCart);
      localStorage.setItem('cart', JSON.stringify(formattedCart));
    } catch (err) {
      console.error('Cart sync failed:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('cart');
        setCartItems([]);
      }
    }
  };

  // Enhanced add to cart function
  const handleAddToCart = async (product, quantity) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('Authentication required');

      await axios.post('/api/cart', 
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await syncCartWithServer();
    } catch (err) {
      console.error('Add to cart failed:', err);
      if (err.response?.status === 401) {
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const userRes = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userRes.data);
          setIsLoggedIn(true);
          await syncCartWithServer();
        } catch (err) {
          localStorage.removeItem('userToken');
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) setCartItems(JSON.parse(localCart));
      }
    };

    initializeApp();
  }, []);

  // Update cart count
  useEffect(() => {
    setCartItemCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
  }, [cartItems]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]);
  };

  return (
    <Router>
      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        handleLogout={handleLogout}
        cartItemCount={cartItemCount}
      />
      <Container className="py-4">
        <Routes>
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
          
          <Route path="/" element={
            <Home cartItems={cartItems} handleAddToCart={handleAddToCart} />
          } />

          <Route path="/products/:id" element={
            <ProductPage handleAddToCart={handleAddToCart} />
          } />

          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage 
                cartItems={cartItems}
                syncCartWithServer={syncCartWithServer}
                setCartItems={setCartItems}
              />
            </ProtectedRoute>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout 
                cartItems={cartItems}
                syncCartWithServer={syncCartWithServer}
              />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/admin/orders/:id" element={<ProtectedRoute><AdminOrderDetails /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;