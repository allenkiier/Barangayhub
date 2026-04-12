import React, { useEffect, useState } from 'react';
import { Grid, Paper, Box, Typography, ThemeProvider, createTheme, styled, CircularProgress } from '@mui/material';

// Modals
import IndigencyRequest from '../modals/IndigencyRequest';
import BrgyIDRequest from '../modals/BrgyIDRequest';
import BrgyClearanceRequest from '../modals/BrgyClearanceRequest';
import BusinessClearanceRequest from '../modals/BusinessClearanceRequest';
import IncidentReportRequest from '../modals/IncidentReportRequest';
import Suggestion from '../modals/Suggestion';
import Complaints from '../modals/Complaints';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import GavelIcon from '@mui/icons-material/Gavel';
import BusinessCenterIcon from '@mui/icons-material/Business';
import ReportProblemIcon from '@mui/icons-material/Report';
import MapsUgcIcon from '@mui/icons-material/MapsUgc';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const ServiceCard = styled(Paper)(({ bgcolor }) => ({
  width: '100%', 
  maxWidth: 250, 
  height: 70, 
  padding: 15, 
  color: '#fff',
  background: bgcolor, 
  display: 'flex', 
  gap: '15px', 
  alignItems: 'center',
  borderRadius: 16, 
  cursor: 'pointer', 
  transition: 'transform 0.2s',
  '&:hover': { transform: 'translateY(-5px)', filter: 'brightness(1.1)' }
}));

const theme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: 'Inter, sans-serif' }
});

// Mapping backend names to UI styles
const SERVICE_CONFIG = {
  'Certificate of Indigency': { icon: <DescriptionIcon />, color: '#1976d2' },
  'Barangay ID Form': { icon: <BadgeIcon />, color: '#9c27b0' },
  'Barangay Clearance': { icon: <GavelIcon />, color: '#2e7d32' },
  'Barangay Business Clearance': { icon: <BusinessCenterIcon />, color: '#ed6c02' },
  'Incident Report': { icon: <ReportProblemIcon />, color: '#d32f2f' },
  'Suggestions': { icon: <MapsUgcIcon />, color: '#0288d1' },
  'Walk-In Complaint': { icon: <ReportProblemIcon />, color: '#6a1b9a' },
};

const TransactionList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  // Safely get User Data
  const getUserData = () => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const userData = getUserData();
  const currentUserId = userData?.userid;

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  const handleCloseModal = () => setSelectedService(null);

  const getStyle = (name) => SERVICE_CONFIG[name] || { icon: <EditDocumentIcon />, color: '#607d8b' };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 4 }}>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CircularProgress size={24} />
            <Typography>Loading available services...</Typography>
          </Box>
        ) : (
          <Grid container spacing={6} justifyContent={services.length === 1 ? 'center' : 'flex-start'} justifyItems={"start"}>
            {services.map((svc) => {
              const { icon, color } = getStyle(svc.trans_name);
              return (
                <Grid item key={svc.trans_id} xs={12} sm={6} md={4} lg={3}>
                  <ServiceCard
                    bgcolor={color}
                    elevation={3}
                    onClick={() => setSelectedService(svc.trans_name)}
                  >
                    <Box sx={{ fontSize: '2.5rem', display: 'flex' }}>{icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {svc.trans_name}
                    </Typography>
                  </ServiceCard>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Conditional Rendering of Modals - Ensures props match server.js logic */}
        
        {selectedService === 'Certificate of Indigency' && (
          <IndigencyRequest
            open={true}
            onClose={handleCloseModal}
            userid={currentUserId}
          />
        )}

        {selectedService === 'Barangay ID Form' && (
          <BrgyIDRequest
            open={true}
            onClose={handleCloseModal}
            userid={currentUserId}
          />
        )}

        {selectedService === 'Barangay Clearance' && (
          <BrgyClearanceRequest
            open={true}
            onClose={handleCloseModal}
            userid={currentUserId}
          />
        )}

        {selectedService === 'Barangay Business Clearance' && (
          <BusinessClearanceRequest
            open={true}
            onClose={handleCloseModal}
            userid={currentUserId}
          />
        )}

        {selectedService === 'Incident Report' && (
          <IncidentReportRequest
            open={true}
            onClose={handleCloseModal}
            userid={currentUserId}
          />
        )}

         {selectedService === 'Suggestions' && (
          <Suggestion
            open={true}
            onClose={handleCloseModal}
          />
        )}

        {selectedService === 'Walk-In Complaint' && (
          <Complaints
            open={true}
            onClose={handleCloseModal}
          />
        )}

        {!loading && services.length === 0 && (
          <Typography sx={{ mt: 4, fontStyle: 'italic', color: 'gray' }}>
            No services currently available.
          </Typography>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default TransactionList;