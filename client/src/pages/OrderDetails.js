// /client/src/pages/OrderDetails.js
import React, { useEffect, useState } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const { data } = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  return (
    <div className="container mt-5">
      <h2>Order Details</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <p>Loading order details...</p>
      ) : order ? (
        <Card>
          <Card.Body>
            <Card.Title>Order #{order._id}</Card.Title>
            <Card.Text>
              <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}<br />
              <strong>Total:</strong> ${order.total.toFixed(2)}<br />
              <strong>Status:</strong> {order.status}<br />
              <strong>Shipping Address:</strong> {order.shippingAddress}
            </Card.Text>

            <h5>Items:</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.product._id}>
                    <td>{item.product.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="warning">Order not found</Alert>
      )}
    </div>
  );
};

export default OrderDetails;