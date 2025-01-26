// /client/src/components/OrderActions.jsx
import { useState } from 'react';
import { Button, Alert, Modal } from 'react-bootstrap';
import { useCancelOrder } from '../api/orders';

const OrderActions = ({ order }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: cancelOrder, isPending, error } = useCancelOrder();
  const canCancel = ['pending', 'processing'].includes(order.status);

  const handleCancel = () => {
    cancelOrder(order._id, {
      onSuccess: () => setShowConfirm(false)
    });
  };

  return (
    <div className="order-actions mt-4">
      {canCancel && (
        <Button 
          variant="outline-danger" 
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
        >
          {isPending ? 'Cancelling...' : 'Request Cancellation'}
        </Button>
      )}

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Are you sure you want to cancel this order?</p>
          <ul>
            <li>Order ID: {order._id}</li>
            <li>Total Amount: ${order.total.toFixed(2)}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCancel}>
            Confirm Cancellation
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderActions;