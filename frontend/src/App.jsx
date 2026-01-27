import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TrackRequest from './pages/TrackRequest';
import ProviderLogin from './pages/ProviderLogin';
import ProviderDashboard from './pages/ProviderDashboard';
import ManageProviders from './pages/ManageProviders';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute'; // Assuming you created this earlier

// Public Pages
import Home from './pages/Home';
import ServiceRequestForm from './pages/ServiceRequestForm';
import FeedbackPage from './pages/FeedbackPage';
import ProviderApplication from './pages/ProviderApplication';
import AdminReports from './pages/AdminReports'; // Import

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageServices from './pages/ManageServices'; // <--- IMPORT THIS
import ManageApplications from './pages/ManageApplications'; // <--- AND THIS (if you created it)
import ManageFeedback from './pages/ManageFeedback';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className=" flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<ServiceRequestForm />} />
          <Route path="/apply" element={<ProviderApplication />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/admin/reports" element={<AdminReports />} /> 
          <Route path="/admin/feedback" element={<ManageFeedback />} />
          <Route path="/provider/login" element={<ProviderLogin />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/track" element={<TrackRequest />} />
          
          <Route path="/admin/dashboard" element={
            <AdminDashboard /> 
            // If you have PrivateRoute, wrap it like: <PrivateRoute><AdminDashboard /></PrivateRoute>
          } />

          {/* THIS WAS MISSING causing the blank page: */}
          <Route path="/admin/services" element={
             <ManageServices /> 
          } />
          <Route path="/admin/providers" element={<ManageProviders />} />
          
          {/* Add this too if you have the file: */}
          <Route path="/admin/applications" element={
             <ManageApplications /> 
          } />

        </Routes>

        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;