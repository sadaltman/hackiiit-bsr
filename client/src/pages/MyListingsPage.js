import { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { getAuthHeader } = useContext(AuthContext);

  useEffect(() => {
    fetchMyListings();
  }, [getAuthHeader]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/listings/user', getAuthHeader());
      setListings(response.data.activeListings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load your listings. Please try again.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`/api/listings/${id}`, getAuthHeader());
        setListings(listings.filter(listing => listing._id !== id));
        setSuccessMessage('Listing deleted successfully!');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error deleting listing:', error);
        setError('Failed to delete listing. Please try again.');
        
        // Hide error message after 3 seconds
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading your listings...</div>;
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Listings</h2>
        <Button as={Link} to="/create-listing" variant="primary">
          Create New Listing
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {listings.length === 0 ? (
        <Alert variant="info">
          You don't have any listings yet. <Link to="/create-listing">Create your first listing</Link>
        </Alert>
      ) : (
        <Row>
          {listings.map((listing) => {
            const listingTypeColor = 
              listing.listingType === 'sell' ? 'primary' : 
              listing.listingType === 'buy' ? 'success' : 'warning';
            
            return (
              <Col key={listing._id} sm={12} md={6} lg={4} className="mb-4">
                <Card className="h-100">
                  {listing.imageFilename ? (
                    <Card.Img
                      variant="top"
                      src={`/uploads/${listing.imageFilename}`}
                      alt={listing.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center"
                      style={{ height: '200px' }}
                    >
                      <i className="bi bi-image text-secondary" style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  <Card.Body>
                    <Card.Title>{listing.title}</Card.Title>
                    <Card.Text className="text-primary fw-bold">
                      ₹{listing.price.toFixed(2)}
                    </Card.Text>
                    <div className="mb-2">
                      <Badge bg={listingTypeColor} className="me-2">
                        {listing.listingType.charAt(0).toUpperCase() + listing.listingType.slice(1)}
                      </Badge>
                      <Badge bg="secondary">{listing.category.name}</Badge>
                    </div>
                    <Card.Text>
                      {listing.description.length > 100
                        ? `${listing.description.substring(0, 100)}...`
                        : listing.description}
                    </Card.Text>
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        as={Link}
                        to={`/listing/${listing._id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        View
                      </Button>
                      <Button
                        as={Link}
                        to={`/edit-listing/${listing._id}`}
                        variant="outline-secondary"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(listing._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                  <Card.Footer className="text-muted">
                    <small>
                      Posted on {new Date(listing.createdAt).toLocaleDateString()}
                    </small>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default MyListingsPage; 