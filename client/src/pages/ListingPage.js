import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeader } = useContext(AuthContext);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [buyRequestSent, setBuyRequestSent] = useState(false);
  const [listingTypeColor, setListingTypeColor] = useState('primary');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axios.get(`/api/listings/${id}`);
        setListing(data);
        
        // Set the badge color based on listing type
        if (data.listingType === 'sell') {
          setListingTypeColor('primary');
        } else if (data.listingType === 'buy') {
          setListingTypeColor('success');
        } else if (data.listingType === 'rent') {
          setListingTypeColor('info');
        } else {
          setListingTypeColor('warning');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to load listing details. Please try again later.');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    try {
      await axios.post(
        '/api/messages',
        {
          listingId: id,
          recipientId: listing.user._id,
          content: message
        },
        getAuthHeader()
      );
      
      setMessage('');
      setMessageSent(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again later.');
    }
  };

  const handleBuyRequest = async () => {
    try {
      await axios.post(
        `/api/listings/${id}/buy`, 
        { purchasePrice: listing.price }, 
        getAuthHeader()
      );
      // Refresh the listing data
      const { data } = await axios.get(`/api/listings/${id}`);
      setListing(data);
      // Show success message
      setBuyRequestSent(true);
      setTimeout(() => {
        setBuyRequestSent(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending buy request:', error);
      setError(error.response?.data?.message || 'Failed to send buy request. Please try again later.');
      // Hide error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleDeleteListing = async () => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/listings/${id}`, getAuthHeader());
        setDeleteSuccess(true);
        // Redirect to my listings page after 2 seconds
        setTimeout(() => {
          navigate('/my-listings');
        }, 2000);
      } catch (error) {
        console.error('Error deleting listing:', error);
        setError('Failed to delete listing. Please try again.');
        // Hide error message after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-5"><i className="bi bi-hourglass-split fs-1"></i><p className="mt-3">Loading listing details...</p></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!listing) {
    return <Alert variant="warning">Listing not found.</Alert>;
  }

  if (deleteSuccess) {
    return <Alert variant="success">Listing deleted successfully! Redirecting to your listings...</Alert>;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          <Card className="mb-4 border-0 shadow-sm">
            {listing.imageFilename ? (
              <Card.Img
                variant="top"
                src={`/uploads/${listing.imageFilename}`}
                alt={listing.title}
                style={{ maxHeight: '400px', objectFit: 'contain' }}
                className="rounded-top"
              />
            ) : (
              <div className="image-placeholder" style={{ height: '300px' }}>
                <i className="bi bi-image text-secondary" style={{ fontSize: '5rem' }}></i>
              </div>
            )}
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="fw-bold">{listing.title}</h2>
                <div className="price-tag">₹{listing.price.toFixed(2)}</div>
              </div>
              
              <div className="mb-4">
                <Badge bg={listingTypeColor} className="me-2">
                  {listing.listingType.charAt(0).toUpperCase() + listing.listingType.slice(1)}
                </Badge>
                <Badge bg="secondary">{listing.category.name}</Badge>
              </div>
              
              <Card.Text className="mb-4">{listing.description}</Card.Text>
              
              <div className="listing-details">
                <h5 className="fw-bold">Details</h5>
                <Row>
                  <Col md={6}>
                    <p><strong>Condition:</strong> {listing.condition || 'Not specified'}</p>
                    <p><strong>Location:</strong> {listing.location || 'Not specified'}</p>
                  </Col>
                  <Col md={6}>
                    <div className="user-info">
                      <div className="user-avatar">
                        {listing.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="mb-0"><strong>Posted by:</strong> {listing.user.username}</p>
                        <p className="mb-0 text-muted small">
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="mb-3 fw-bold">Actions</h4>
              
              {user ? (
                <>
                  {user._id === listing.user._id ? (
                    <>
                      <div className="d-grid gap-2 mb-3">
                        <Button
                          as={Link}
                          to={`/edit-listing/${listing._id}`}
                          variant="outline-primary"
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="bi bi-pencil me-2"></i> Edit Listing
                        </Button>
                        <Button
                          variant="outline-danger"
                          className="d-flex align-items-center justify-content-center mt-2"
                          onClick={handleDeleteListing}
                        >
                          <i className="bi bi-trash me-2"></i> Delete Listing
                        </Button>
                      </div>
                      
                      {listing.buyRequests && listing.buyRequests.length > 0 && (
                        <div className="mt-4">
                          <h5 className="mb-3">Buy Requests</h5>
                          {listing.buyRequests.map((request) => (
                            <div key={request._id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                              <span>{request.user.username}</span>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => navigate(`/conversation/${request.user._id}/${listing._id}`)}
                              >
                                Message
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {listing.listingType === 'sell' && !listing.buyer && (
                        <div className="d-grid gap-2 mb-3">
                          <Button
                            variant="success"
                            onClick={handleBuyRequest}
                            className="d-flex align-items-center justify-content-center"
                            disabled={listing.buyRequests?.some(req => req.user._id === user._id)}
                          >
                            <i className="bi bi-bag-check me-2"></i>
                            {listing.buyRequests?.some(req => req.user._id === user._id)
                              ? 'Buy Request Sent'
                              : 'Send Buy Request'}
                          </Button>
                          {buyRequestSent && (
                            <Alert variant="success" className="mt-2">
                              Buy request sent successfully!
                            </Alert>
                          )}
                        </div>
                      )}
                      
                      <h5 className="mt-4 mb-3">Contact Seller</h5>
                      {messageSent && (
                        <Alert variant="success">
                          Message sent successfully!
                        </Alert>
                      )}
                      
                      <Form onSubmit={handleSendMessage}>
                        <Form.Group className="mb-3" controlId="message">
                          <Form.Control
                            as="textarea"
                            rows={4}
                            value={message}
                            onChange={handleMessageChange}
                            placeholder="Write your message here..."
                            required
                          />
                        </Form.Group>
                        <div className="d-grid">
                          <Button variant="primary" type="submit">
                            <i className="bi bi-send me-2"></i> Send Message
                          </Button>
                        </div>
                      </Form>
                      
                      <div className="mt-3 text-center">
                        <Link to={`/conversation/${listing.user._id}/${listing._id}`} className="text-decoration-none">
                          View conversation history
                        </Link>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Alert variant="info">
                  Please <Link to="/login">login</Link> to contact the seller or make a purchase.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ListingPage; 