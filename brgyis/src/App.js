import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/Profiling';
import Council from './pages/Council';
import UserViewCouncil from './pages/UserViewCouncil';
import AdminTransaction from './pages/AdminTransaction';
import Admission from './pages/Admission';
import UserRequest from './pages/UserRequest';

// --- The Protected Route Wrapper ---
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userStr = localStorage.getItem("user");
  
  if (!userStr) {
    // No user logged in? Redirect to login page
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(userStr);

  // If the route is admin only but the user isn't an admin, kick them to user dash
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/user-dash" replace />;
  }

  return children;
};

function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />

          {/* User Protected Routes */}
          <Route path='/user-dash' element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/councilprev" element={<ProtectedRoute><UserViewCouncil /></ProtectedRoute>} />
          <Route path="/request" element={<ProtectedRoute><UserRequest /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path='/admin-dash' element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/council" element={<ProtectedRoute adminOnly={true}><Council /></ProtectedRoute>} />
          <Route path="/transaction-history" element={<ProtectedRoute adminOnly={true}><AdminTransaction /></ProtectedRoute>} />
          <Route path="/adminAdmit" element={<ProtectedRoute adminOnly={true}><Admission /></ProtectedRoute>} />
          
          {/* Catch-all: Redirect unknown URLs to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;