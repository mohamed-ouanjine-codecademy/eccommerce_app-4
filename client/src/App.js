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
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Fetch user and cart data on login state change
  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (token) {
          const userRes = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userRes.data);

          const cartRes = await axios.get('/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCartItems(cartRes.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    if (isLoggedIn) fetchUserAndCart();
  }, [isLoggedIn]);

  // Update cart count whenever cart items change
  useEffect(() => {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartItemCount(totalQuantity);
  }, [cartItems]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <Router>
      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        setIsLoggedIn={setIsLoggedIn}
        cartItemCount={cartItemCount}
      />
      <Container>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                cartItems={cartItems}
                setCartItems={setCartItems}  // MUST BE PASSED HERE
                setCartItemCount={setCartItemCount}
              />
            }
          />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage
                  cartItems={cartItems}
                  setCartItems={setCartItems}  // Ensure this is passed
                />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout 
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  setCartItemCount={setCartItemCount}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders/:id" 
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders/:id" 
            element={
              <ProtectedRoute>
                <AdminOrderDetails />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;