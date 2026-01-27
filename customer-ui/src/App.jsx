import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Customer Pages
import Home from './pages/Home';
import ServiceRequestForm from './pages/ServiceRequestForm';
import TrackRequest from './pages/TrackRequest';
import FeedbackPage from './pages/FeedbackPage';

// Provider Pages (Kept in customer-ui as requested)
import ProviderApplication from './pages/ProviderApplication';
import ProviderLogin from './pages/ProviderLogin';
import ProviderDashboard from './pages/ProviderDashboard';

// Error Page
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/request" element={<ServiceRequestForm />} />
            <Route path="/track" element={<TrackRequest />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/apply" element={<ProviderApplication />} />

            {/* Provider Portal */}
            <Route path="/provider/login" element={<ProviderLogin />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;