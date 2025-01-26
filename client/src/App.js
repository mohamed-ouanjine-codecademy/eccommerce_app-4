// /client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Add this import
import { ErrorBoundary } from './components/ErrorBoundary';
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
import { queryClient } from './lib/react-query';
import axios from 'axios';
import { useAuth } from './hooks/useAuth';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const { initializeAuth } = useAuth();

  // Initialize auth and cart
  useEffect(() => {
    const initializeApp = async () => {
      await initializeAuth();
      await syncCartWithServer();
    };
    initializeApp();
  }, []);

  useEffect(() => {
    setCartItemCount(cartItems?.reduce((count, item) => count + item.quantity, 0) || 0);
  }, [cartItems]);

  const syncCartWithServer = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const { data } = await axios.get('/cart');
      setCartItems(data);
      localStorage.setItem('cart', JSON.stringify(data));
    } catch (err) {
      console.error('Cart sync failed:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('cart');
        setCartItems([]);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]);
    queryClient.clear();
  };

  return (
    <Router>
      <ErrorBoundary>
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

            <Route path="/" element={<Home cartItems={cartItems} />} />
            <Route path="/products/:id" element={<ProductPage />} />

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
      </ErrorBoundary>
    </Router>
  );
};

// Wrap the app in providers in a separate component
const AppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <App />
  </QueryClientProvider>
);

export default AppWrapper;