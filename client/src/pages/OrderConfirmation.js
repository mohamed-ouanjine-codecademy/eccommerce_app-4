// /client/src/pages/OrderConfirmation.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Alert, Button, Spinner } from 'react-bootstrap';
import { useOrderDetails } from '../api/orders';
import { useWebSocket } from '../hooks/useWebSocket';
import { formatDate } from '../utils/formatting';
import OrderActions from '../components/OrderActions';

const OrderConfirmation = () => {
  const { id } = useParams();
  const { data: order, isLoading, isError, error } = useOrderDetails(id);
  const { status: realtimeStatus } = useWebSocket(`order:${id}`);

  useEffect(() => {
    if (realtimeStatus && order) {
      order.status = realtimeStatus;
    }
  }, [realtimeStatus, order]);

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading order...</span>
        </Spinner>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          {error?.message || 'Failed to load order details'}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <Card.Title>Order #{order._id}</Card.Title>
              <Card.Subtitle className="text-muted mb-2">
                Placed on {formatDate(order.createdAt)}
              </Card.Subtitle>
            </div>
            <Button 
              variant="outline-primary" 
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Shipping Address</h5>
              <p className="text-muted">{order.shippingAddress}</p>
            </div>
            <div className="col-md-6">
              <h5>Order Status</h5>
              <StatusBadge status={order.status} />
            </div>
          </div>

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
                  <td>
                    <div className="d-flex align-items-center">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{ width: '50px', marginRight: '15px' }}
                      />
                      {item.product.name}
                    </div>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-end mt-4">
            <h4>Grand Total: ${order.total.toFixed(2)}</h4>
          </div>

          <div className="mt-4 d-flex justify-content-between">
            <Button variant="outline-secondary" as={Link} to="/orders">
              Back to Orders
            </Button>
            <Button variant="primary" as={Link} to="/">
              Continue Shopping
            </Button>
          </div>
        </Card.Body>
      </Card>

      <RealTimeUpdates order={order} />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger'
  };

  return (
    <Alert variant={statusColors[status]} className="d-inline-block mb-0">
      {status.toUpperCase()}
    </Alert>
  );
};

const RealTimeUpdates = ({ order }) => {
  if (!['shipped', 'delivered'].includes(order.status)) {
    return (
      <Alert variant="info" className="mt-4">
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-2" />
          You'll receive real-time updates about your order status here
        </div>
      </Alert>
    );
  }
  
  return (
    <Alert variant="success" className="mt-4">
      <h5>Shipping Updates</h5>
      <ul className="list-unstyled">
        <li>📦 Item shipped on {formatDate(order.updatedAt)}</li>
        {order.status === 'delivered' && (
          <li>✅ Delivered on {formatDate(order.deliveredAt)}</li>
        )}
      </ul>
    </Alert>
  );
};

export default OrderConfirmation;