import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Alert, Form } from 'react-bootstrap';
import axios from 'axios';

const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/listings/search?q=${query}`);
        setListings(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load search results. Please try again.');
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setListings([]);
      setLoading(false);
    }
  }, [query]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const sortedAndFilteredListings = () => {
    // First filter by type
    let filtered = listings;
    if (filterType !== 'all') {
      filtered = listings.filter(listing => listing.listingType === filterType);
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return <div className="text-center mt-5">Searching...</div>;
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        {error}
      </Alert>
    );
  }

  const displayListings = sortedAndFilteredListings();

  return (
    <div className="py-4">
      <h2 className="mb-4">
        {query ? `Search Results for "${query}"` : 'Search Results'}
      </h2>
      
      {query ? (
        <>
          <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center">
            <p className="mb-0">{displayListings.length} listings found</p>
            
            <div className="d-flex flex-wrap">
              <Form.Group className="me-3 mb-2 mb-md-0">
                <Form.Label>Filter by:</Form.Label>
                <Form.Select value={filterType} onChange={handleFilterChange}>
                  <option value="all">All Types</option>
                  <option value="sell">Selling</option>
                  <option value="buy">Buying</option>
                  <option value="rent">Renting</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group>
                <Form.Label>Sort by:</Form.Label>
                <Form.Select value={sortBy} onChange={handleSortChange}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          {displayListings.length === 0 ? (
            <Alert variant="info">
              No listings found matching your search criteria.
            </Alert>
          ) : (
            <Row>
              {displayListings.map((listing) => {
                const listingTypeColor = 
                  listing.listingType === 'sell' ? 'primary' : 
                  listing.listingType === 'buy' ? 'success' : 
                  listing.listingType === 'rent' ? 'info' : 'warning';
                
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
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Posted by {listing.user.username}
                        </small>
                        <Button
                          as={Link}
                          to={`/listing/${listing._id}`}
                          variant="outline-primary"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </>
      ) : (
        <Alert variant="info">
          Please enter a search term to find listings.
        </Alert>
      )}
    </div>
  );
};

export default SearchPage; 