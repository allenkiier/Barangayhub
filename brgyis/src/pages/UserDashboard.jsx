import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import UserSideBar from '../components/UserSideBar';
import TransactionList from '../components/TransactionList';
import ProfileBadge from '../components/ProfileBadge';
import isProfileComplete from '../utility/isProfileComplete';
import { Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import CallIcon from '@mui/icons-material/Call';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const UserDashboard = () => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const [greeting, setGreeting] = useState('');
  const [username, setUsername] = useState('');
  const [isComplete, setIsComplete] = useState(true);

  

  useEffect(() => {
    // ✅ 3. CHECK-ON-MOUNT (Security Guard)
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!storedUser || !storedUser.userid) {
      // If no session exists, kick them to login immediately
      navigate("/", { replace: true });
      return; // Stop the rest of the code from running
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
        setUsername("User"); // fallback
      });

      fetch(`http://localhost:3001/api/user/${storedUser.userid}`)
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.user_name);
        // Check if profile is complete
        setIsComplete(isProfileComplete(data)); 
      });

  }, [navigate]); // 4. Add navigate to dependency array

  return (
    <>
    <div className="main-dash">
      <UserSideBar />
      <div className="dashCont">
        <div className="usercont">
          <div id="header">
            <div>
              <h4>Barangay Joyao Joyao Information System</h4>
              <h5>Barangay Joyao Joyao, Numancia, Aklan, Philippines</h5>
              <h5>v1.0.0</h5>
            </div>
            <div id='side-head'>
              <div style={{ textAlign: "right", paddingTop:"10px"}}>
                <h5>{greeting}</h5>
                {/* 5. Optional: Show a loading state or the username */}
                <h5>{username || "Loading..."}</h5>
              </div>
              <ProfileBadge isComplete={isComplete} />
            </div>
          </div>
          <br />
          <h1>Barangay E-Services</h1> <br />
          <Typography variant="body1">
            Select a service below. Forms are auto-filled via your profile.
          </Typography>
          <TransactionList/>
        </div>

        
      </div>
      </div>
      <footer style={{ width: '94%', marginTop: 'auto', padding: "0 40px"}}>
        <hr style={{ height: '2px', backgroundColor: 'black', border: 'none', marginBottom: 5 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#444" }}>
            <div style={{ textAlign: "left" }}>
                    <p style={{ fontWeight: 'bold' }}>Joyao-Joyao Multi Purpose-Hall</p>
                    <p>Numancia 5604, Aklan Philippines</p>
                  </div>
                  <div style={{ textAlign: "left" }}>
                      <p><FacebookIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Brgy. Joyao-Joyao</p>
                      <p><CallIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> 265-3774</p>
                      <p><MailOutlineIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> blgujoyaojoyao03@gmail.com</p>
                  </div>
            </div>
          </footer>
    
    </>
  );
};

export default UserDashboard;