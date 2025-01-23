// src/pages/Orders.js
import React, { useEffect, useState } from 'react';
import { Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const { data } = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load orders');
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Your Orders</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  {order.items.map(item => (
                    <div key={item.product._id}>
                      {item.product.name} (x{item.quantity}) - ${item.price.toFixed(2)} each
                    </div>
                  ))}
                </td>
                <td>${order.total.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <Link to={`/orders/${order._id}`} className="btn btn-sm btn-info">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Orders;