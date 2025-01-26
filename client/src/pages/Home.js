// /client/src/pages/Home.js
import React, { useState } from 'react';
import { Card, Button, Row, Col, Container, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useProducts } from '../api/products';
import { useAddToCart } from '../api/cart';
import { useAuth } from '../hooks/useAuth';
import { QueryKeys } from '../lib/react-query';

const Home = () => {
  const [quantities, setQuantities] = useState({});
  const { user } = useAuth();
  
  // Using React Query hook for products
  const { 
    data: productsData,
    isLoading,
    isError,
    error 
  } = useProducts({
    page: 1,
    limit: 12,
    sort: '-createdAt'
  });

  // Using mutation hook for adding to cart
  const { mutate: addToCart, isPending: isAdding } = useAddToCart();

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(newQuantity, 10))
    }));
  };

  const handleAddToCartClick = (product) => {
    const quantity = quantities[product._id] || 1;
    addToCart(
      { productId: product._id, quantity },
      {
        onSuccess: () => {
          // Optimistically update the UI
          setQuantities(prev => ({
            ...prev,
            [product._id]: 1
          }));
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
      <Container className="py-5">
        <Alert variant="danger">
          {error.message || 'Failed to load products'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Featured Products</h1>
      
      <Row>
        {productsData?.products.map((product) => (
          <Col key={product._id} xs={12} md={6} lg={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={product.image || 'https://via.placeholder.com/200x300?text=Product+Image'}
                style={{ 
                  height: '200px',
                  objectFit: 'cover',
                  padding: '10px'
                }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>
                  <Link 
                    to={`/products/${product._id}`} 
                    className="text-decoration-none text-dark"
                  >
                    {product.name}
                  </Link>
                </Card.Title>
                <Card.Text className="h5 text-success">
                  ${product.price?.toFixed(2) || '0.00'}
                </Card.Text>
                
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(product._id, (quantities[product._id] || 1) - 1)}
                    disabled={(quantities[product._id] || 1) <= 1}
                  >
                    -
                  </Button>
                  <span className="fw-bold">{quantities[product._id] || 1}</span>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(product._id, (quantities[product._id] || 1) + 1)}
                    disabled={(quantities[product._id] || 1) >= 10}
                  >
                    +
                  </Button>
                </div>

                <Button 
                  variant="primary"
                  onClick={() => handleAddToCartClick(product)}
                  disabled={isAdding || product.stock === 0}
                  className="mt-auto"
                >
                  {isAdding ? (
                    <>
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Adding...</span>
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;