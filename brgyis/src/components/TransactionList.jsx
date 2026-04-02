import React, { useEffect, useState } from 'react';
import { Grid, Paper, Box, Typography, ThemeProvider, createTheme, styled } from '@mui/material';

// Modals
import IndigencyRequest from '../modals/IndigencyRequest';
import BrgyIDRequest from '../modals/BrgyIDRequest';
import BrgyClearanceRequest from '../modals/BrgyClearanceRequest'
import BusinessClearanceRequest from '../modals/BusinessClearanceRequest';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import GavelIcon from '@mui/icons-material/Gavel';
import BusinessCenterIcon from '@mui/icons-material/Business';
import ReportProblemIcon from '@mui/icons-material/Report';
import MapsUgcIcon from '@mui/icons-material/MapsUgc';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const ServiceCard = styled(Paper)(({ bgcolor }) => ({
  width: '100%', maxWidth: 250, height: 95, padding: 15, color: '#fff',
  background: bgcolor, display: 'flex', gap: '15px', alignItems: 'center',
  borderRadius: 16, cursor: 'pointer', transition: 'transform 0.2s',
  '&:hover': { transform: 'translateY(-5px)', filter: 'brightness(1.1)' }
}));

const theme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: 'Inter, sans-serif' }
});

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
  const [selectedService, setSelectedService] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const currentUserId = userData?.userid;

  useEffect(() => {
    fetch('http://localhost:3001/api/transactions')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error("Fetch Error:", err));
  }, []);

  const handleCloseModal = () => setSelectedService(null);

  const getStyle = (name) => SERVICE_CONFIG[name] || { icon: <EditDocumentIcon />, color: '#607d8b' };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>
            Barangay E-Services
          </Typography>
          <Typography variant="body1">
            Select a service below. Forms are auto-filled via your profile.
          </Typography>
        </Box>

        <Grid container spacing={3}>
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

        {/* Modals */}
        <IndigencyRequest
          open={selectedService === 'Certificate of Indigency'}
          onClose={handleCloseModal}
          userId={currentUserId}
        />

        <BrgyIDRequest
          open={selectedService === 'Barangay ID Form'}
          onClose={handleCloseModal}
          userId={currentUserId}
        />

        <BrgyClearanceRequest
          open={selectedService === 'Barangay Clearance'}
          onClose={handleCloseModal}
          userId={currentUserId}
        />

          <BusinessClearanceRequest
            open={selectedService === 'Barangay Business Clearance'}
            onClose={handleCloseModal}
            userId={currentUserId}
          />

        {services.length === 0 && (
          <Typography sx={{ mt: 4, fontStyle: 'italic', color: 'gray' }}>
            Loading services...
          </Typography>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default TransactionList;