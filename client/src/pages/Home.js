// /client/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = ({ handleAddToCart }) => { // Remove unused props
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingAddToCart, setLoadingAddToCart] = useState(null);
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(newQuantity, 10)) // Limit max quantity to 10
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data.map(p => ({
          ...p,
          // Ensure price is formatted as number
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price
        })));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCartClick = async (product) => {
    setLoadingAddToCart(product._id);
    try {
      const quantity = quantities[product._id] || 1;
      
      // Use real-time stock check from API
      const { data: freshProduct } = await axios.get(`/api/products/${product._id}`);
      if (freshProduct.stock < quantity) {
        setError(`Only ${freshProduct.stock} available in stock`);
        return;
      }

      // Pass full product details to cart
      await handleAddToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: freshProduct.stock // Use latest stock info
      }, quantity);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setLoadingAddToCart(null);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Featured Products</h1>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product._id} className="mb-4">
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
                    <Link to={`/products/${product._id}`} className="text-decoration-none">
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
                    disabled={loadingAddToCart === product._id}
                    className="mt-auto"
                  >
                    {loadingAddToCart === product._id ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Adding...
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
      )}
    </Container>
  );
};

export default Home;