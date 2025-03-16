import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row className="align-items-center justify-content-between py-4">
          <Col md={4} className="text-center text-md-start mb-4 mb-md-0">
            <h5 className="mb-3 fw-bold">College Marketplace</h5>
            <p className="mb-0">
              A safe place to buy and sell on campus
            </p>
          </Col>
          <Col md={4} className="text-center mb-4 mb-md-0">
            <div className="d-flex justify-content-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light">
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-light">
                <i className="bi bi-twitter fs-4"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light">
                <i className="bi bi-instagram fs-4"></i>
              </a>
            </div>
          </Col>
          <Col md={4} className="text-center text-md-end">
            <p className="mb-2">
              &copy; {new Date().getFullYear()} College Marketplace
            </p>
            <p className="mb-0">
              <Link to="/terms" className="text-light text-decoration-none me-2">Terms</Link> | 
              <Link to="/privacy" className="text-light text-decoration-none ms-2">Privacy</Link>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 