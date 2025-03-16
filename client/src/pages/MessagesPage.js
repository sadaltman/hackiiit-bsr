import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, Badge, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getAuthHeader } = useContext(AuthContext);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/messages', getAuthHeader());
        setConversations(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load conversations. Please try again.');
        setLoading(false);
      }
    };

    fetchConversations();
  }, [getAuthHeader]);

  if (loading) {
    return <div className="text-center mt-5">Loading conversations...</div>;
  }

  return (
    <div className="py-4">
      <h2 className="mb-4">My Messages</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {conversations.length === 0 ? (
        <Alert variant="info">
          You don't have any messages yet.
        </Alert>
      ) : (
        <Row>
          <Col md={12} lg={10} xl={8} className="mx-auto">
            <Card>
              <ListGroup variant="flush">
                {conversations.map((conversation) => {
                  const otherUser = conversation.otherUser;
                  const listing = conversation.listing;
                  const latestMessage = conversation.latestMessage;
                  const unreadCount = conversation.unreadCount;
                  
                  return (
                    <ListGroup.Item
                      key={`${otherUser._id}-${listing._id}`}
                      action
                      as={Link}
                      to={`/conversation/${otherUser._id}/${listing._id}`}
                      className={`d-flex justify-content-between align-items-start py-3 ${unreadCount > 0 ? 'bg-light' : ''}`}
                    >
                      <div className="ms-2 me-auto">
                        <div className="d-flex align-items-center mb-1">
                          <span className="fw-bold">{otherUser.username}</span>
                          {unreadCount > 0 && (
                            <Badge bg="primary" pill className="ms-2">
                              {unreadCount} new
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted small mb-1">
                          Re: {listing.title}
                        </div>
                        <div className="text-truncate" style={{ maxWidth: '500px' }}>
                          {latestMessage.content}
                        </div>
                      </div>
                      <small className="text-muted">
                        {new Date(latestMessage.createdAt).toLocaleDateString()}
                      </small>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default MessagesPage; 