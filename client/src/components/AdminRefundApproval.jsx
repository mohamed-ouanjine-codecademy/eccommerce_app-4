// /client/src/components/AdminRefundApproval.jsx
import { useState } from 'react';
import { Button, Alert, Modal, Form } from 'react-bootstrap';
import { useProcessRefund } from '../api/refunds';

const AdminRefundApproval = ({ refundRequest }) => {
  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState('');
  const { mutate, isPending, error } = useProcessRefund();
  const [partialAmount, setPartialAmount] = useState('');

  const handleDecision = () => {
    mutate({
      refundId: refundRequest._id,
      decision,
      amount: decision === 'partial' ? partialAmount : refundRequest.amount
    }, {
      onSuccess: () => setShowModal(false)
    });
  };

  return (
    <>
      <Button variant="outline-info" onClick={() => setShowModal(true)}>
        Review Refund
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Process Refund #{refundRequest._id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Refund Decision</Form.Label>
            <Form.Select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="">Select action</option>
              <option value="approve">Approve Full Refund</option>
              <option value="partial">Partial Refund</option>
              <option value="reject">Reject Request</option>
            </Form.Select>
          </Form.Group>

          {decision === 'partial' && (
            <Form.Group className="mb-3">
              <Form.Label>Partial Amount</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max={refundRequest.amount}
                step="0.01"
                placeholder="Enter partial refund amount"
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDecision} disabled={!decision}>
            {isPending ? 'Processing...' : 'Submit Decision'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};