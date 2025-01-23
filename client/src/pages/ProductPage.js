// /client/src/pages/ProductPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Alert, Form } from 'react-bootstrap';
import axios from 'axios';

const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Validate ID before making request
        if (!id || !mongoose.isValidObjectId(id)) {
          setError('Invalid product identifier');
          setLoading(false);
          return;
        }
        
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        // Handle specific error types
        if (err.response?.data?.error === 'INVALID_ID') {
          setError('Invalid product ID format');
        } else {
          setError(err.response?.data?.message || 'Product not found');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'stockUpdate' && data.productId === productId) {
        setProduct(prev => ({ ...prev, stock: data.stock }));
      }
    };
  
    return () => ws.close();
  }, [productId]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product._id, quantity);
    }
  };

  if (loading) return <Container className="mt-5"><p>Loading product...</p></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-5">
      <Row>
        {/* Product Image */}
        <Col md={6}>
          <Image 
            src={product.image} 
            alt={product.name} 
            fluid 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400.png?text=Product+Image';
            }}
          />
        </Col>

        {/* Product Details */}
        <Col md={6}>
          <h1>{product.name}</h1>
          <p className="lead">${product.price.toFixed(2)}</p>
          
          <div className="mb-3">
            <p>{product.description}</p>
          </div>

          <div className="mb-4">
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
            <div className="d-flex align-items-center gap-3 mb-4">
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(e.target.value, product.stock)))}
                min="1"
                max={product.stock}
                style={{ width: '100px' }}
              />
              <Button 
                variant="primary" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Add to Cart
              </Button>
            </div>
          )}

          <div className="mt-4">
            <Button variant="outline-secondary" href="/">
              Continue Shopping
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;