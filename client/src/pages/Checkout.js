// /client/src/pages/Checkout.js
import React, { useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../api/cart';
import { useCreateOrder } from '../api/orders';
import { usePayment } from '../api/payment';
import { calculateCartTotal } from '../utils/cart';
import { shallow } from 'zustand/shallow';
import useCheckoutStore from '../store/checkout';

const Checkout = () => {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { mutate: processPayment, isPending: isProcessingPayment } = usePayment();
  
  const [setOrderConfirmation] = useCheckoutStore(
    (state) => [state.setOrderConfirmation],
    shallow
  );

  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const total = calculateCartTotal(cart?.items);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Process payment
      const paymentResult = await processPayment({
        amount: total,
        currency: 'USD'
      });

      if (!paymentResult.success) {
        throw new Error('Payment authorization failed');
      }

      // Create order
      createOrder(
        {
          shippingAddress,
          paymentId: paymentResult.transactionId,
          items: cart.items
        },
        {
          onSuccess: (order) => {
            setOrderConfirmation(order);
            navigate(`/orders/${order._id}`);
          },
          onError: (error) => {
            setError(error.message);
          }
        }
      );

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error?.message || 'Checkout failed. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Checkout</h2>

      {cart?.items?.length > 0 && (
        <div className="mb-3">
          <h4>Order Total: ${total.toFixed(2)}</h4>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4 shadow-sm">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Shipping Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
              placeholder="Enter full shipping address including zip code"
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              type="submit"
              size="lg"
              disabled={isProcessingPayment || isCreatingOrder}
              variant={error ? 'danger' : 'primary'}
            >
              {isProcessingPayment || isCreatingOrder ? (
                <>
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Processing...
                </>
              ) : error ? (
                'Try Again'
              ) : (
                'Confirm Order'
              )}
            </Button>
            
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/cart')}
              disabled={isProcessingPayment || isCreatingOrder}
            >
              Back to Cart
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Checkout;