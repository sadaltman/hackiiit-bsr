import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingPage from './pages/ListingPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import MessagesPage from './pages/MessagesPage';
import ConversationPage from './pages/ConversationPage';
import PrivateRoute from './components/PrivateRoute';
import ThemeProvider from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/listing/:id" element={<ListingPage />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              
              {/* Private Routes */}
              <Route path="/create-listing" element={<PrivateRoute><CreateListingPage /></PrivateRoute>} />
              <Route path="/edit-listing/:id" element={<PrivateRoute><EditListingPage /></PrivateRoute>} />
              <Route path="/my-listings" element={<PrivateRoute><MyListingsPage /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
              <Route path="/conversation/:userId/:listingId" element={<PrivateRoute><ConversationPage /></PrivateRoute>} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App; 