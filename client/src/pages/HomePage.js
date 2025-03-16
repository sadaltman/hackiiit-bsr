import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import axios from 'axios';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndListings = async () => {
      try {
        const [categoriesRes, listingsRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/listings?limit=6')
        ]);
        
        setCategories(categoriesRes.data);
        setRecentListings(listingsRes.data.listings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchCategoriesAndListings();
  }, []);

  return (
    <>
      <div className="jumbotron p-5 rounded mb-5">
        <h1 className="display-4 fw-bold">Welcome to College Marketplace</h1>
        <p className="lead fs-4">
          Buy, sell, and rent items with other students on your campus.
        </p>
        <hr className="my-4" />
        <p className="mb-4">
          From textbooks to furniture, find everything you need for college life.
        </p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Get Started
        </Link>
      </div>

      <h2 className="mb-4 fw-bold">Browse Categories</h2>
      <Row className="mb-5 g-4">
        {categories.map((category) => (
          <Col key={category._id} xs={6} md={4} lg={3} className="mb-3">
            <Card className="h-100 category-card">
              <Card.Body>
                <Card.Title>{category.name}</Card.Title>
                <Link
                  to={`/category/${category._id}`}
                  className="btn btn-outline-primary"
                >
                  Browse
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h2 className="mb-4 fw-bold">Recent Listings</h2>
      <Row className="g-4">
        {recentListings.map((listing) => {
          const listingTypeColor = 
            listing.listingType === 'sell' ? 'primary' : 
            listing.listingType === 'buy' ? 'success' : 
            listing.listingType === 'rent' ? 'info' : 'warning';
          
          return (
            <Col key={listing._id} sm={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 listing-card">
                {listing.imageFilename ? (
                  <Card.Img
                    variant="top"
                    src={`/uploads/${listing.imageFilename}`}
                    alt={listing.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="image-placeholder">
                    <i className="bi bi-image text-secondary" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
                <Card.Body>
                  <Card.Title className="text-truncate">{listing.title}</Card.Title>
                  <div className="price-tag mb-2">₹{listing.price.toFixed(2)}</div>
                  <div className="mb-2">
                    <Badge bg={listingTypeColor} className="me-2">
                      {listing.listingType.charAt(0).toUpperCase() + listing.listingType.slice(1)}
                    </Badge>
                    {listing.category && (
                      <Badge bg="secondary">{listing.category.name}</Badge>
                    )}
                  </div>
                  <Card.Text className="text-muted small">
                    {listing.description.length > 100
                      ? `${listing.description.substring(0, 100)}...`
                      : listing.description}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-transparent border-top-0">
                  <Link to={`/listing/${listing._id}`} className="btn btn-primary w-100">
                    View Details
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default HomePage; 