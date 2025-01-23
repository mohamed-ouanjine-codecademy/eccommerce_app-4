import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ cartItems, setCartItemCount, setCartItems }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate cart items
      if (!cartItems?.length) {
        throw new Error('Your cart is empty');
      }

      const token = localStorage.getItem('userToken');
      console.log('Initiating checkout process...');
  
      // [1] Calculate Total
      const totalAmount = cartItems?.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      ) || 0;
      console.log('Cart total calculated:', totalAmount);
  
      // [2] Mock Payment Processing
      console.log('Starting mock payment...');
      const paymentResponse = await axios.post(
        '/api/orders/payment/mock',
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Payment response:', paymentResponse.data);
  
      if (!paymentResponse.data.success) {
        throw new Error('Payment processing failed - contact support');
      }
  
      // [3] Create Order
      console.log('Creating order with shipping address:', shippingAddress);
      const orderResponse = await axios.post(
        '/api/orders',
        {
          shippingAddress,
          paymentConfirmed: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Order created:', orderResponse.data);
  
      // [4] Clear Cart State
      console.log('Clearing cart...');
      setCartItems([]);
      setCartItemCount(0);
  
      // [5] Redirect
      console.log('Redirecting to order confirmation...');
      navigate(`/orders/${orderResponse.data._id}`);
  
    } catch (err) {
      console.error('Checkout Error:', {
        error: err.response?.data || err.message,
        config: err.config
      });
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {cartItems?.length > 0 ? (
        <Card className="p-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Shipping Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </Form>
        </Card>
      ) : (
        <Alert variant="warning">Your cart is empty</Alert>
      )}
    </div>
  );
};

export default Checkout;