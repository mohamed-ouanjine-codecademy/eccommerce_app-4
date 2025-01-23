// src/pages/AdminOrderDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const { data } = await axios.get(`/api/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load order details');
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
              <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}<br/>
              <strong>Total:</strong> ${(order.total || 0).toFixed(2)}<br/>
              <strong>Status:</strong> {order.status}
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
                {order.items?.map(item => (
                  <tr key={item._id || item.product?._id}>
                    <td>{item.product?.name || 'Product unavailable'}</td>
                    <td>${(item.price || 0).toFixed(2)}</td>
                    <td>{item.quantity || 0}</td>
                    <td>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
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

export default AdminOrderDetails;