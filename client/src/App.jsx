import React from 'react';
import { Routes, Route, Outlet, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SOS from './pages/SOS';
import Community from './pages/Community';
import Profile from './pages/Profile';
import GuardianDashboard from './pages/GuardianDashboard';
import ResponderDashboard from './pages/ResponderDashboard';
import Dashboard from './pages/Dashboard';
import Guardians from './pages/Guardians';
import Resources from './pages/Resources';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import ReportIncident from './pages/ReportIncident';
import MyReports from './pages/MyReports';
import ReportDetail from './pages/ReportDetail';
import PrivateRoute from './components/PrivateRoute';

// Admin components
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import SOSAlerts from './pages/admin/SOSAlerts';
import AdminRedirect from './pages/AdminRedirect';
import AdminNotFound from './pages/admin/NotFound';

// Import admin debug utility
import './utils/AdminAuthDebug';

function App() {
  // Debug log for App component
  console.log("App component rendering");
  console.log("Current path:", window.location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Routes>
        {/* Admin redirect path - this helps ensure proper admin authentication */}
        <Route path="/admin-access" element={<AdminRedirect />} />
        
        {/* Admin Routes - These use a different layout without the main Navbar */}
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="sos-alerts" element={<SOSAlerts />} />
          {/* Catch all route for admin section */}
          <Route path="*" element={<AdminNotFound />} />
          {/* Additional admin routes would go here */}
        </Route>
        
        {/* Main App Routes with Navbar and Footer */}
        <Route 
          path="/" 
          element={
            <>
              <Navbar />
              <main className="container mx-auto px-4 py-8 flex-grow">
                <Outlet />
              </main>
              <Footer />
            </>
          }
        >
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="contact" element={<Contact />} />
          <Route path="resources" element={<Resources />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="sos" element={
            <PrivateRoute>
              <SOS />
            </PrivateRoute>
          } />
          <Route path="community" element={
            <PrivateRoute>
              <Community />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="guardian-dashboard" element={
            <PrivateRoute roles={['guardian']}>
              <GuardianDashboard />
            </PrivateRoute>
          } />
          <Route path="responder-dashboard" element={
            <PrivateRoute roles={['responder']}>
              <ResponderDashboard />
            </PrivateRoute>
          } />
          <Route path="guardians" element={
            <PrivateRoute>
              <Guardians />
            </PrivateRoute>
          } />
          <Route path="report-incident" element={
            <PrivateRoute>
              <ReportIncident />
            </PrivateRoute>
          } />
          <Route path="my-reports" element={
            <PrivateRoute>
              <MyReports />
            </PrivateRoute>
          } />
          <Route path="reports/:id" element={
            <PrivateRoute>
              <ReportDetail />
            </PrivateRoute>
          } />
          
          {/* Fallback Route */}
          <Route path="*" element={
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
              <p className="mb-4">Sorry, the page you are looking for does not exist.</p>
              <Link to="/" className="text-primary hover:underline">
                Return to Home
              </Link>
            </div>
          } />
        </Route>
      </Routes>
    </div>
  );
}

export default App; 