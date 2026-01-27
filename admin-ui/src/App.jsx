import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Remove Router/BrowserRouter from here
import { Toaster } from 'react-hot-toast';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageServices from './pages/ManageServices';
import ManageProviders from './pages/ManageProviders';
import ManageApplications from './pages/ManageApplications';
import ManageFeedback from './pages/ManageFeedback';
import AdminReports from './pages/AdminReports';

// Protected Route Wrapper
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <> {/* Use a fragment instead of <Router> */}
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50">
        <Routes>
          {/* Admin Portal starts at the Login page */}
          <Route path="/" element={<AdminLogin />} />

          {/* All other routes are protected */}
          <Route path="/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/services" element={<PrivateRoute><ManageServices /></PrivateRoute>} />
          <Route path="/providers" element={<PrivateRoute><ManageProviders /></PrivateRoute>} />
          <Route path="/applications" element={<PrivateRoute><ManageApplications /></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute><ManageFeedback /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><AdminReports /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App;