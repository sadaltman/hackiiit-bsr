import { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EditListingPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    listingType: '',
    location: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { getAuthHeader } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingRes, categoriesRes] = await Promise.all([
          axios.get(`/api/listings/${id}`, getAuthHeader()),
          axios.get('/api/categories'),
        ]);
        
        const listing = listingRes.data;
        
        setFormData({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category._id,
          condition: listing.condition,
          listingType: listing.listingType,
          location: listing.location,
        });
        
        if (listing.imageFilename) {
          setCurrentImage(`/uploads/${listing.imageFilename}`);
        }
        
        setCategories(categoriesRes.data);
        setInitialLoading(false);
      } catch (error) {
        setError('Failed to load listing data. Please try again.');
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, getAuthHeader]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
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
    setLoading(true);
    setError('');

    try {
      // Create FormData object to handle file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('category', formData.category);
      formDataObj.append('condition', formData.condition);
      formDataObj.append('listingType', formData.listingType);
      formDataObj.append('location', formData.location);
      
      if (image) {
        formDataObj.append('image', image);
      }

      await axios.put(
        `/api/listings/${id}`,
        formDataObj,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      navigate(`/listing/${id}`);
    } catch (error) {
      setError(
        error.response?.data?.message || 'Failed to update listing. Please try again.'
      );
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="text-center mt-5">Loading listing data...</div>;
  }

  return (
    <div className="d-flex justify-content-center">
      <Card className="p-4 shadow" style={{ maxWidth: '800px', width: '100%' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Edit Listing</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter a descriptive title"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a title.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your item in detail"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a description.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="price">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter price"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid price.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select a category.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="condition">
              <Form.Label>Condition</Form.Label>
              <Form.Select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="listingType">
              <Form.Label>Listing Type</Form.Label>
              <Form.Select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                required
              >
                <option value="sell">Selling</option>
                <option value="buy">Buying</option>
                <option value="rent">Renting</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="location">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Campus location (e.g., North Dorms, Library)"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a location.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="image">
              <Form.Label>Image</Form.Label>
              {currentImage && !imagePreview && (
                <div className="mb-2">
                  <p>Current Image:</p>
                  <img
                    src={currentImage}
                    alt="Current"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </div>
              )}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Form.Text className="text-muted">
                Upload a new image to replace the current one (optional).
              </Form.Text>
              {imagePreview && (
                <div className="mt-2">
                  <p>New Image Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </div>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Listing'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditListingPage; 