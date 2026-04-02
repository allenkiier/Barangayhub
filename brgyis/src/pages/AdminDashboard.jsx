import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import AdminSideBar from '../components/AdminSideBar';
import OpenMessages from '../components/OpenMesssages';

const AdminDashboard = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [greeting, setGreeting] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // ✅ 3. CHECK-ON-MOUNT (Security Guard + Role Check)
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Check if user exists AND if they are actually an admin
    if (!storedUser || !storedUser.userid) {
      navigate("/", { replace: true });
      return;
    }

    if (!storedUser.isAdmin) {
      // If a regular user tries to access this, boot them to the user dash
      navigate("/user-dash", { replace: true });
      return;
    }

    // ✅ Greeting logic
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
    );

    // ✅ Fetch correct username from backend
    fetch(`http://localhost:3001/api/user/${storedUser.userid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUsername(data.user_name);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setUsername("Admin"); 
      });

  }, [navigate]);

  return (
    <div className="main-dash">
      <AdminSideBar />

      <div className="dashCont">
        <div className="usercont">
          <div id="header">
            <div>
              <h4>Barangay Joyao Joyao Information System</h4>
              <h5>Barangay Joyao Joyao, Numancia, Aklan, Philippines</h5>
              <h5>v1.0.0</h5>
            </div>
            <div id='side-head'>
              <div style={{ textAlign: "right" }}>
                <h5>{greeting}</h5>
                <h5>{username || "Loading..." }</h5>
              </div>
            </div>
          </div>

          <br />
          <h1>Admin Dashboard</h1> 
          <br />
          <OpenMessages />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;