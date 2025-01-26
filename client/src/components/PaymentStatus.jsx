// /client/src/components/PaymentStatus.jsx
import { usePaymentStatus } from '../api/payments';
import { useState } from 'react';
import { Spinner, Badge, Modal, ListGroup } from 'react-bootstrap';
import { formatDate } from '../utils/formatting';

const PaymentStatus = ({ paymentId }) => {
  const { data: payment, isLoading, error } = usePaymentStatus(paymentId);
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) return <Spinner size="sm" />;
  if (error) return <Alert variant="danger">Payment status unavailable</Alert>;

  return (
    <div className="payment-status">
      <Badge bg={statusColors[payment.status]} onClick={() => setShowDetails(true)}>
        {payment.status}
      </Badge>

      <Modal show={showDetails} onHide={() => setShowDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            <ListGroup.Item>Amount: ${payment.amount}</ListGroup.Item>
            <ListGroup.Item>Method: {payment.method}</ListGroup.Item>
            <ListGroup.Item>Processor: {payment.processor}</ListGroup.Item>
            <ListGroup.Item>Last Updated: {formatDate(payment.updatedAt)}</ListGroup.Item>
          </ListGroup>
        </Modal.Body>
      </Modal>
    </div>
  );
};