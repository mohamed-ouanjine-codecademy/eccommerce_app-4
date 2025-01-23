// src/pages/Checkout.js
import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ cartItems, setCartItems, setCartItemCount, syncCartWithServer }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate total function
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product?.price) || 0; // Force numeric conversion
      return sum + (price * item.quantity);
    }, 0);
  };

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('userToken');

    try {
      // 1. Validate cart and total
      const total = calculateTotal();
      if (isNaN(total) || total <= 0) {
        throw new Error('Invalid cart total');
      }

      // 2. Process payment
      const paymentResponse = await axios.post(
        'http://localhost:5000/api/orders/payment/mock',
        { amount: total.toFixed(2) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!paymentResponse.data.success) {
        throw new Error('Payment authorization failed');
      }

      // 3. Create order
      const orderResponse = await axios.post(
        'http://localhost:5000/api/orders', // Direct server URL
        {
          shippingAddress,
          paymentConfirmed: true,
          cartItems // Add this line to send cart items
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Handle success
      if (orderResponse.data.success) {
        setCartItems([]);
        setCartItemCount(0);
        navigate(`/orders/${orderResponse.data.order._id}`);
      } else {
        throw new Error('Order creation failed');
      }

    } catch (err) {
      console.error('Full error object:', err); // Add detailed logging
      const serverMessage = err.response?.data?.error?.message;
      const errorMessage = serverMessage || 
                          err.message || 
                          'Order failed. Please contact support.';
      setError(errorMessage);

      // 5. Sync cart if error contains stock information
      if (errorMessage.toLowerCase().includes('stock')) {
        try {
          await syncCartWithServer();
        } catch (refreshError) {
          console.error('Cart refresh failed:', refreshError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>

      {!error && cartItems?.length > 0 && (
        <div className="mb-3">
          <strong>Total:</strong> ${calculateTotal()}
        </div>
      )}

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

            <Button
              type="submit"
              disabled={loading}
              variant={error ? 'danger' : 'primary'}
            >
              {loading ? 'Processing...' : error ? 'Try Again' : 'Place Order'}
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