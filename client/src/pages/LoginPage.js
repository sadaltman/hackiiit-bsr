import { useState, useContext } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validated, setValidated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a redirect path from the location state
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoginError('');

    try {
      await login(formData.email, formData.password);
      // Redirect to the page they were trying to access, or home if they came directly to login
      navigate(from, { replace: true });
    } catch (error) {
      setLoginError(
        error.response?.data?.message || 'Failed to login. Please try again.'
      );
    }
  };

  return (
    <div className="d-flex justify-content-center py-5">
      <Card className="p-4 shadow-sm border-0" style={{ maxWidth: '500px', width: '100%' }}>
        <Card.Body>
          <h2 className="text-center mb-4 fw-bold">Login</h2>
          
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your IIIT email"
                pattern="[a-zA-Z0-9._%+-]+@(students\.iiit\.ac\.in|research\.iiit\.ac\.in)$"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid IIIT email (students.iiit.ac.in or research.iiit.ac.in).
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <Form.Control.Feedback type="invalid">
                Please provide your password.
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2">
              <i className="bi bi-box-arrow-in-right me-2"></i>Login
            </Button>
          </Form>
          
          <div className="text-center mt-4">
            <p className="mb-0">
              Don't have an account?{' '}
              <Link to="/register" className="text-decoration-none">Register here</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage; 