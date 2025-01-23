// src/components/Header.js
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap'; // Add Button import
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, user, cartItemCount, handleLogout }) => {
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (cartItemCount === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">My Ecommerce</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <>
                {user?.isAdmin && (
                  <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                )}
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                <Nav.Link as={Link} to="/cart">Cart ({cartItemCount})</Nav.Link>
                <Button
                  variant="outline-light"
                  onClick={handleCheckoutClick}
                  className="ms-2"
                >
                  Checkout
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={handleLogout} // Use the prop directly
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;