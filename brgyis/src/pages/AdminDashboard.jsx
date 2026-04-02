import React, { useEffect, useState } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import OpenMessages from '../components/OpenMesssages';

const AdminDashboard = () => {
  const [greeting, setGreeting] = useState('');
    const [username, setUsername] = useState('');
  
    useEffect(() => {
      // ✅ Greeting logic
      const hour = new Date().getHours();
      setGreeting(
        hour < 12
          ? 'Good Morning'
          : hour < 18
          ? 'Good Afternoon'
          : 'Good Evening'
      );
  
      // ✅ Get user from localStorage safely
      const storedUser = JSON.parse(localStorage.getItem('user'));
  
      if (!storedUser?.userid) {
        console.error("No user found in localStorage");
        setUsername("Guest");
        return;
      }
  
      // ✅ Fetch correct username from backend
      fetch(`http://localhost:3001/api/user/${storedUser.userid}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((data) => {
          // 🔥 This matches backend: { username: row.user_name }
          setUsername(data.user_name);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setUsername("Guest"); // fallback only if API fails
        });
  
    }, []);
  
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
                <h5>{username}</h5>
              </div>
            </div>
          </div>

          <br />
          <h1>Admin Dashboard</h1> <br />
        </div>
        <OpenMessages />
      </div>
    </div>
  );
}

export default AdminDashboard