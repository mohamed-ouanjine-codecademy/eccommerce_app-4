// src/pages/CartPage.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = ({ cartItems, setCartItems }) => { // Add setCartItems prop
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Add this function
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('userToken');
      newQuantity = Math.max(1, newQuantity); // Ensure quantity never drops below 1

      // Optimistic update with product data preservation
      setCartItems(prev => prev.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: newQuantity, product: item.product } // Preserve product data
          : item
      ));

      // API call
      await axios.patch(`/api/cart/${productId}`, 
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    } catch (err) {
      setError('Failed to update quantity');
      // Rollback using original product data
      setCartItems(prev => prev.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: err.config.data.quantity, product: item.product }
          : item
      ));
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setCartItems(prev => prev.filter(item => item.product._id !== productId));
      
    } catch (err) {
      console.error('Remove item failed:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p>Your cart is empty</p>
          <Button as={Link} to="/" variant="primary">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.product._id}>
                <td>{item.product?.name || 'Product unavailable'}</td>
                <td>${item.product?.price?.toFixed(2) || '0.00'}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline-secondary"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button 
                      size="sm" 
                      variant="outline-secondary"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </td>
                <td>${((item.product?.price || 0) * item.quantity).toFixed(2)}</td>
                <td>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleRemoveItem(item.product._id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Button 
        onClick={() => navigate('/checkout')}
        disabled={cartItems.length === 0}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};

export default CartPage;