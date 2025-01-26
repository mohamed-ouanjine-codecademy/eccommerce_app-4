// /client/src/pages/CartPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '../api/cart';
import { useWebSocket } from '../hooks/useWebSocket';
import { calculateCartTotal } from '../utils/cart';
import { QueryKeys } from '../lib/react-query';

const CartPage = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading, isError, error } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();
  const [processingId, setProcessingId] = useState(null);
  const [stockErrors, setStockErrors] = useState({});

  // Real-time stock updates
  const productIds = cart?.items?.map(item => item.product._id) || [];
  useWebSocket(productIds);

  const handleQuantityChange = (productId, newQuantity) => {
    setProcessingId(`update-${productId}`);
    updateItem(
      { productId, quantity: newQuantity },
      {
        onSettled: () => setProcessingId(null),
      }
    );
  };

  const handleRemoveItem = (productId) => {
    setProcessingId(`remove-${productId}`);
    removeItem(productId, {
      onSettled: () => setProcessingId(null),
    });
  };

  const verifyStock = useCallback(() => {
    const errors = {};
    cart?.items?.forEach(item => {
      if (item.quantity > item.product.stock) {
        errors[item.product._id] = 
          `Only ${item.product.stock} available (you have ${item.quantity})`;
      }
    });
    setStockErrors(errors);
  }, [cart]);

  useEffect(() => {
    if (cart) verifyStock();
  }, [cart, verifyStock]);

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading cart...</span>
        </Spinner>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error.message || 'Failed to load cart'}</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      
      {cart?.items?.length === 0 ? (
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
              {cart?.items?.map((item) => {
                const price = item.product?.price || 0;
                const itemTotal = price * item.quantity;
                const isUpdating = processingId === `update-${item.product._id}`;
                const isRemoving = processingId === `remove-${item.product._id}`;

                return (
                  <tr key={item.product._id}>
                    <td>
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="me-3"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                      )}
                      {item.product.name}
                    </td>
                    <td>${price.toFixed(2)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          -
                        </Button>
                        <span>{isUpdating ? <Spinner size="sm" /> : item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
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
                        onClick={() => handleRemoveItem(item.product._id)}
                        disabled={isRemoving}
                      >
                        {isRemoving ? <Spinner size="sm" /> : 'Remove'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="text-end mb-4">
            <h4>Grand Total: ${calculateCartTotal(cart?.items).toFixed(2)}</h4>
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

              {cart?.items?.map(item => (
                stockErrors[item.product._id] && (
                  <Alert
                    key={item.product._id}
                    variant="warning"
                    className="d-flex align-items-center justify-content-between py-2"
                  >
                    <div>
                      <strong>{item.product.name}</strong>
                      <div className="small mt-1">
                        {stockErrors[item.product._id]}
                      </div>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.product._id)}
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