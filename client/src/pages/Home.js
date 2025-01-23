import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

const Home = ({ cartItems, setCartItems, setCartItemCount }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingAddToCart, setLoadingAddToCart] = useState(null);
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Number(newQuantity))
    }));
  };

  const handleAddToCart = async (productId) => {
    setLoadingAddToCart(productId);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Please login to add items to cart');
        return;
      }

      const quantity = quantities[productId] || 1;
      const addedProduct = products.find(p => p._id === productId);

      // Optimistic update
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => item.product._id === productId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }
        return [...prev, { product: addedProduct, quantity }];
      });

      // API call
      await axios.post('/api/cart', 
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update cart count
      // setCartItemCount(prev => prev + quantity);

    } catch (err) {
      // Rollback on error
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => item.product._id === productId);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity -= quantity;
          if (updated[existingIndex].quantity <= 0) {
            updated.splice(existingIndex, 1);
          }
          return updated;
        }
        return prev;
      });
      setError(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setLoadingAddToCart(null);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Container>
      <h1 className="my-4">Featured Products</h1>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={product.image}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x300?text=Product+Image';
                  }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>${product.price.toFixed(2)}</Card.Text>
                  
                  <div className="d-flex align-items-center gap-2 mb-3">
                  <Button
                    onClick={() => handleQuantityChange(product._id, (Number(quantities[product._id]) || 1) - 1)}
                  >
                    -
                  </Button>
                  <span>{quantities[product._id] || 1}</span>
                  <Button
                    onClick={() => handleQuantityChange(product._id, (Number(quantities[product._id]) || 1) + 1)}
                  >
                    +
                  </Button>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={loadingAddToCart === product._id}
                    className="mt-auto"
                  >
                    {loadingAddToCart === product._id ? 'Adding...' : 'Add to Cart'}
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