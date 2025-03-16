import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ConversationPage = () => {
  const { userId, listingId } = useParams();
  const [messages, setMessages] = useState([]);
  const [listingDetails, setListingDetails] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { user, getAuthHeader } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // Get messages for this conversation
        const messagesRes = await axios.get(`/api/messages/${userId}/${listingId}`, getAuthHeader());
        setMessages(messagesRes.data);
        
        // Get listing details
        const listingRes = await axios.get(`/api/listings/${listingId}`);
        setListingDetails(listingRes.data);
        
        // Set other user info from the first message
        if (messagesRes.data.length > 0) {
          const firstMessage = messagesRes.data[0];
          const otherUserInfo = firstMessage.sender._id === user._id ? 
            firstMessage.recipient : firstMessage.sender;
          setOtherUser(otherUserInfo);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        setError('Failed to load conversation. Please try again.');
        setLoading(false);
      }
    };

    fetchConversation();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      if (!loading) {
        fetchNewMessages();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userId, listingId, getAuthHeader, user, loading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchNewMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${userId}/${listingId}`, getAuthHeader());
      if (response.data.length > messages.length) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching new messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    setError('');
    
    try {
      const response = await axios.post(
        '/api/messages',
        {
          content: newMessage,
          recipientId: userId,
          listingId: listingId
        },
        getAuthHeader()
      );
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading conversation...</div>;
  }

  if (!listingDetails) {
    return (
      <Alert variant="warning" className="mt-4">
        Listing not found.
      </Alert>
    );
  }

  return (
    <div className="py-4">
      <Row>
        <Col md={12} lg={10} xl={8} className="mx-auto">
          <div className="mb-4">
            <Link to="/messages" className="btn btn-outline-secondary mb-3">
              &larr; Back to Messages
            </Link>
            
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Conversation with {otherUser?.username || 'User'}</h5>
                  <small className="text-muted">
                    About: <Link to={`/listing/${listingId}`}>{listingDetails.title}</Link>
                  </small>
                </div>
                <Link to={`/listing/${listingId}`} className="btn btn-sm btn-outline-primary">
                  View Listing
                </Link>
              </Card.Header>
            </Card>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card className="mb-3">
              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="d-flex flex-column">
                    {messages.map((message) => {
                      const isCurrentUser = message.sender._id === user._id;
                      
                      return (
                        <div
                          key={message._id}
                          className={`mb-2 d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div
                            className={`p-3 rounded ${
                              isCurrentUser ? 'bg-primary text-white' : 'bg-light'
                            }`}
                            style={{ maxWidth: '75%' }}
                          >
                            <div>{message.content}</div>
                            <div className={`text-${isCurrentUser ? 'light' : 'muted'} small mt-1`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      required
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ConversationPage; 