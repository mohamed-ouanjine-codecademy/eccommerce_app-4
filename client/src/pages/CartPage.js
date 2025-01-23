// /client/src/pages/CartPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = ({ cartItems, setCartItems, syncCartWithServer }) => {
  const [error, setError] = useState('');
  const [stockErrors, setStockErrors] = useState({});
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      setProcessing(`update-${productId}`);
      const token = localStorage.getItem('userToken');
      newQuantity = Math.max(1, newQuantity);

      // Verify product exists in cart first
      const cartItem = cartItems.find(item => item.product?._id === productId);
      if (!cartItem) {
        setError('This item is no longer in your cart');
        setCartItems(prev => prev.filter(item => item.product?._id !== productId));
        return;
      }

      // Update server first
      await axios.patch(`/api/cart/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await syncCartWithServer();

      // Then update local state
      setCartItems(prev => prev.map(item =>
        item.product?._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));

    } catch (err) {
      if (err.response?.status === 404) {
        // Product not found in server's cart - sync state
        setCartItems(prev => prev.filter(item => item.product?._id !== productId));
        setError('This item was removed from your cart');
        await syncCartWithServer();
      } else {
        setError(err.response?.data?.error || 'Failed to update quantity');
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setProcessing(`remove-${productId}`);
      const token = localStorage.getItem('userToken');

      await axios.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await syncCartWithServer();

      setCartItems(prev => prev.filter(item => item.product._id !== productId));
    } catch (err) {
      setError('Failed to remove item: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(null);
    }
  };

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  }, [cartItems]);

  const verifyStock = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      const errors = {};

      await Promise.all(cartItems.map(async (item) => {
        if (!item.product?._id) {
          errors[item._id] = 'Invalid product reference';
          return;
        }

        try {
          const { data } = await axios.get(`/api/products/${item.product._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (data.stock < item.quantity) {
            errors[item.product._id] = `Only ${data.stock} available (you have ${item.quantity})`;
          }
        } catch (err) {
          errors[item.product._id] = 'Failed to verify stock';
        }
      }));

      setStockErrors(errors);
    } catch (err) {
      setError('Failed to verify stock levels');
    }
  }, [cartItems]);

  useEffect(() => {
    if (cartItems.length > 0) {
      verifyStock();
    }
  }, [cartItems, verifyStock]);

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-4">Your cart is empty</p>
          <Button as={Link} to="/" variant="primary" size="lg">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const price = item.product?.price || 0;
                const itemTotal = price * item.quantity;
                const isUpdating = processing === `update-${item.product?._id}`;
                const isRemoving = processing === `remove-${item.product?._id}`;

                return (
                  <tr key={item.product?._id || item._id}>
                    <td>
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="me-3"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                      )}
                      {item.product?.name || 'Product unavailable'}
                    </td>
                    <td>${price.toFixed(2)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          -
                        </Button>
                        <span>{isUpdating ? <Spinner animation="border" size="sm" /> : item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                          disabled={isUpdating}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td>${itemTotal.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product?._id)}
                        disabled={isRemoving}
                      >
                        {isRemoving ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          'Remove'
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="text-end mb-4">
            <h4>
              Grand Total: ${calculateTotal().toFixed(2)}
            </h4>
          </div>

          <div className="d-flex justify-content-between">
            <Button variant="outline-primary" as={Link} to="/">
              Continue Shopping
            </Button>

            <Button
              variant="success"
              size="lg"
              onClick={() => navigate('/checkout')}
              disabled={Object.keys(stockErrors).length > 0}
            >
              Proceed to Checkout
              {Object.keys(stockErrors).length > 0 && (
                <span className="ms-2">⚠️ Resolve issues first</span>
              )}
            </Button>
          </div>

          {Object.keys(stockErrors).length > 0 && (
            <div className="mt-4">
              <Alert variant="danger" className="mb-3">
                <strong>Action Required:</strong> Some items have stock issues
              </Alert>

              {cartItems.map(item => (
                stockErrors[item.product?._id] && (
                  <Alert
                    key={item.product?._id}
                    variant="warning"
                    className="d-flex align-items-center justify-content-between py-2"
                  >
                    <div>
                      <strong>{item.product?.name || 'Unknown Product'}</strong>
                      <div className="small mt-1">
                        {stockErrors[item.product?._id]}
                      </div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.product?._id)}
                    >
                      Remove Item
                    </Button>
                  </Alert>
                )
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;