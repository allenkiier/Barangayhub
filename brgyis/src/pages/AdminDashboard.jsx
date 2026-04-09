import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import AdminSideBar from '../components/AdminSideBar';
import OpenMessages from '../dashboard-components/OpenMesssages';
import { Box, Divider, Grid } from '@mui/material';
import Statistics from '../dashboard-components/Statistics';
import Residentials from '../dashboard-components/Residentials';  
import TransactionPanel from '../dashboard-components/TransactionPanel';  

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
    fetch(`http://localhost:5000/api/user/${storedUser.userid}`)
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
          <Divider style={{ marginTop: "10px", marginBottom: "10px", borderBottomWidth: "4px", backgroundColor: "#060745" }} />

          {/* ================= Dashboard Area ================= */}
          <Grid sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'center', height: "70vh"}}>
            <Box sx={{width: "85%", mr: 4, height: "100%"}}>
                <Box sx={{ display: 'flex', flexDirection: 'row',  justifyContent: 'start', mb: 4}}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start", width: "30%"}}>
                    <Statistics />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "35%", gap: 2, marginRight: 4}}>
                    <Residentials />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "40%", border: "1px solid #ddd", borderRadius: "8px", px: 3, py: 1, background: "white" }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: 190,
                        position: "relative",
                        overflow: "hidden",
                        mt: 1 ,
                        borderRadius: "8px",
                      }}
                    >
                      {/* Image */}
                      <Box
                        component="img"
                        src="/bryhall.jpg"
                        alt="image"
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      {/* Vignette Overlay */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          borderRadius: "2px",
                          pointerEvents: "none",
                          background: `
                            radial-gradient(
                              circle at center,
                              rgba(0,0,0,0) 40%,
                              #060745 100%
                            )
                          `,
                        }}
                      />
                    </Box>
                    <TransactionPanel />
                  </Box>
                </Box>
            </Box>
            <Box sx={{ width: "23%" }}>
                <OpenMessages />
            </Box>
          </Grid>    
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;