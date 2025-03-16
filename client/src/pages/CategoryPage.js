import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Badge, Alert, Form } from 'react-bootstrap';
import axios from 'axios';

const CategoryPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchCategoryAndListings = async () => {
      try {
        // Fetch category details
        const categoryRes = await axios.get(`/api/categories/${id}`);
        setCategory(categoryRes.data);
        
        // Fetch listings for this category
        const listingsRes = await axios.get(`/api/listings?category=${id}`);
        setListings(listingsRes.data.listings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load category data. Please try again later.');
        setLoading(false);
      }
    };

    fetchCategoryAndListings();
  }, [id]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  // Sort and filter listings
  const getSortedAndFilteredListings = () => {
    // First filter by type
    let filteredListings = [...listings];
    
    if (filterType !== 'all') {
      filteredListings = filteredListings.filter(
        listing => listing.listingType === filterType
      );
    }
    
    // Then sort
    switch (sortBy) {
      case 'price-low':
        return filteredListings.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filteredListings.sort((a, b) => b.price - a.price);
      case 'oldest':
        return filteredListings.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case 'newest':
      default:
        return filteredListings.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const displayListings = getSortedAndFilteredListings();

  if (loading) {
    return <div className="text-center py-5"><i className="bi bi-hourglass-split fs-1"></i><p className="mt-3">Loading category data...</p></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!category) {
    return <Alert variant="warning">Category not found.</Alert>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">{category.name}</h1>
        <div className="d-flex gap-3">
          <Form.Group controlId="sortBy">
            <Form.Select value={sortBy} onChange={handleSortChange} className="form-select-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group controlId="filterType">
            <Form.Select value={filterType} onChange={handleFilterChange} className="form-select-sm">
              <option value="all">All Types</option>
              <option value="sell">Selling</option>
              <option value="buy">Buying</option>
              <option value="exchange">Exchange</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      {displayListings.length === 0 ? (
        <Alert variant="info">
          No listings found in this category.
        </Alert>
      ) : (
        <Row className="g-4">
          {displayListings.map((listing) => {
            const listingTypeColor = 
              listing.listingType === 'sell' ? 'primary' : 
              listing.listingType === 'buy' ? 'success' : 'warning';
            
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
      )}
    </>
  );
};

export default CategoryPage; 