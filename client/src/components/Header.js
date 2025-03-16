import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, Button, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaMoon, FaSun, FaSearch, FaList, FaHome, FaPlus, FaEnvelope, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { ThemeContext } from '../ThemeContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout, getAuthHeader } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch unread message count when user is logged in
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const { data } = await axios.get('/api/messages/unread', getAuthHeader());
          setUnreadCount(data.unreadCount);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();

    // Set up interval to check for new messages every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [user, getAuthHeader]);

  const logoutHandler = () => {
    logout();
    navigate('/');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${searchTerm}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="header-fixed">
      <Navbar bg="primary" variant="dark" expand="lg" className="navbar-custom py-2" fixed="top">
        <Container fluid className="px-3 px-md-4 px-lg-5">
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-0 me-lg-3">
            <FaShoppingCart className="me-2" /> College Marketplace
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
            <Nav className="align-items-center">
              <Nav.Link as={Link} to="/" className="nav-link-custom d-flex align-items-center">
                <FaHome className="me-1" /> Home
              </Nav.Link>
              <NavDropdown 
                title={<span className="d-flex align-items-center"><FaList className="me-1" /> Categories</span>} 
                id="categories-dropdown"
                className="nav-dropdown-custom"
              >
                {categories.map((category) => (
                  <NavDropdown.Item 
                    as={Link} 
                    to={`/category/${category._id}`} 
                    key={category._id}
                    className="dropdown-item-custom"
                  >
                    {category.name}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            </Nav>
            
            <Form onSubmit={submitHandler} className="d-flex mx-lg-2 my-2 my-lg-0 search-form">
              <div className="position-relative search-container">
                <Form.Control
                  type="text"
                  name="q"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="search-input"
                />
                <FaSearch className="search-icon" />
              </div>
              <Button type="submit" variant="outline-light" className="ms-2 search-button">
                Search
              </Button>
            </Form>
            
            <Nav className="align-items-center">
              <Button 
                onClick={toggleTheme} 
                variant="outline-light" 
                className="me-2 theme-toggle-btn"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <FaMoon /> : <FaSun />}
              </Button>
              
              {user ? (
                <>
                  <Nav.Link as={Link} to="/messages" className="nav-link-custom d-flex align-items-center position-relative">
                    <FaEnvelope className="me-1" /> Messages
                    {unreadCount > 0 && (
                      <Badge 
                        bg="danger" 
                        pill 
                        className="notification-badge position-absolute"
                        style={{ 
                          top: '0px', 
                          right: '0px', 
                          transform: 'translate(25%, -25%)',
                          fontSize: '0.65rem'
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/create-listing" className="nav-link-custom d-flex align-items-center">
                    <FaPlus className="me-1" /> Create Listing
                  </Nav.Link>
                  <NavDropdown 
                    title={
                      <span className="d-flex align-items-center">
                        <FaUser className="me-1" /> {user.username || user.name}
                      </span>
                    } 
                    id="username-dropdown"
                    className="nav-dropdown-custom"
                  >
                    <NavDropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/my-listings" className="dropdown-item-custom">
                      My Listings
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logoutHandler} className="dropdown-item-custom">
                      <FaSignOutAlt className="me-1" /> Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="nav-link-custom d-flex align-items-center">
                    <FaSignInAlt className="me-1" /> Sign In
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="nav-link-custom d-flex align-items-center">
                    <FaUserPlus className="me-1" /> Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 