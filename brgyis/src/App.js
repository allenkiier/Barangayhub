import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';



import UserSignup from "./pages/UserSignup";
import UserLogin from "./pages/UserLogin";
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/Profiling'
import Council from './pages/Council';
import UserViewCouncil from './pages/UserViewCouncil';


function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path='/user-dash' element={<UserDashboard />} />
          <Route path='/admin-dash' element={<AdminDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/council" element={<Council />} />
          <Route path="/councilprev" element={<UserViewCouncil />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
