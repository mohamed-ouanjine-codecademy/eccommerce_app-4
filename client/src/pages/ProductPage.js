// /client/src/pages/ProductPage.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Alert, Form, Spinner } from 'react-bootstrap';
import { useProductDetails } from '../api/products';
import { useAddToCart } from '../api/cart';
import { useWebSocket } from '../hooks/useWebSocket';
import { showErrorToast } from '../utils/notifications';

const ProductPage = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  
  // React Query for product data
  const { 
    data: product, 
    isLoading, 
    isError,
    error 
  } = useProductDetails(id);

  // Cart mutation
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

  // WebSocket for real-time updates
  const { stock } = useWebSocket(id);

  useEffect(() => {
    if (stock !== undefined && product) {
      product.stock = stock;
    }
  }, [stock, product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(
      { productId: id, quantity },
      {
        onSuccess: () => {
          setQuantity(1);
        },
        onError: (error) => {
          showErrorToast(error.message);
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error?.message || 'Product not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6}>
          <Image 
            src={product.image} 
            alt={product.name}
            fluid
            className="product-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400.png?text=Product+Image';
            }}
          />
        </Col>

        <Col md={6}>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price h4 text-primary">
            ${product.price.toFixed(2)}
          </p>
          
          <div className="product-description mb-4">
            <h4>Description</h4>
            <p>{product.description || 'No description available'}</p>
          </div>

          <div className="stock-info mb-4">
            <h5>Availability</h5>
            {product.stock > 0 ? (
              <span className="text-success">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-danger">Out of Stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="add-to-cart-section mb-4">
              <Form.Group controlId="productQuantity">
                <Form.Label>Quantity</Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    value={quantity}
                    onChange={(e) => 
                      setQuantity(Math.min(
                        Math.max(1, parseInt(e.target.value) || 1),
                        product.stock
                      ))
                    }
                    min="1"
                    max={product.stock}
                    style={{ width: '80px' }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setQuantity(Math.min(quantity + 1, product.stock))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </Button>
                </div>
              </Form.Group>

              <Button 
                variant="primary" 
                size="lg"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="mt-3"
              >
                {isAdding ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Adding to Cart...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </Button>
            </div>
          )}

          <div className="product-meta">
            <p className="text-muted">
              Category: {product.category || 'Uncategorized'}
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;