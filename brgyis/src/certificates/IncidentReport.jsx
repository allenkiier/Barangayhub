import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import CallIcon from '@mui/icons-material/Call';
import MailOutlineIcon from '@mui/icons-material/MailOutline';




const IncidentReport = ({ request, officials }) => {
  if (!request) return null;

  const punongBarangay = officials?.find(o => o.role === 'Punong Barangay')?.name || "  ";
  const barangaySecretary = officials?.find(o => o.role === 'Barangay Secretary')?.name || "  ";

  // Data mapping from the database object
  const reportData = {
    transactionId: request.transaction_id || "N/A",
    fullName: request.user_name || "__________________________",
    residentAddress: request.address || "__________________________________________________",
    incidentDate: request.incident_date || "________",
    incidentTime: request.incident_time || "________",
    incidentPlace: request.incident_address || "__________________________",
    narrative: request.narrative || "No narrative provided.",
    dateCreated: request.created_at ? new Date(request.created_at).toLocaleDateString() : "________"
  };

  return (
    <Box sx={{
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      backgroundColor: 'white',
      margin: 'auto',
      fontFamily: '"Times New Roman", Times, serif',
      color: 'black',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', gap: 20 }}>
          <img src='/bryimg.png' alt='logo' style={{ width: 70, height: 70 }} />
          <div style={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ lineHeight: 1.2 }}>Republic of the Philippines</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.2 }}>Province of Aklan</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.2 }}>Municipality of Numancia</Typography>
            <Typography variant="h6" sx={{ fontSize: 14, fontWeight: 900 }}>BARANGAY JOYAO-JOYAO</Typography>
          </div>
          <img src='/bago.png' alt='logo' style={{ width: 80, height: 60 }} />
        </div>
        <hr style={{ height: '3px', backgroundColor: '#060745', border: 'none', margin: '10px 0' }} />
        <Typography 
          style={{ 
            fontFamily: "'Old English Text MT', serif", 
            fontSize: '22px', 
            color: '#060745', 
            marginTop: '5px'
          }}
        >
          Office of the Punong Barangay
        </Typography>
      </Box>

      {/* Reference Number & Date */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body1"><b>B.R. No:</b> {reportData.transactionId}</Typography>
        <Typography variant="body1"><b>Date:</b> {reportData.dateCreated}</Typography>
      </Box>

      {/* Complainant Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <b>NAME OF COMPLAINANT:</b> {reportData.fullName}
        </Typography>
        <Typography variant="body1">
          <b>ADDRESS:</b> {reportData.residentAddress}
        </Typography>
      </Box>

      {/* Main Content Box */}
      <Box sx={{ border: '2px solid black', height: 350}}>
        {/* Title Bar */}
        <Box 
          sx={{ 
            borderBottom: '2px solid black', 
            p: 1, 
            textAlign: 'center',
            backgroundColor: '#f5f5f5'
          }}
        >
          <Typography sx={{ fontWeight: 'bold', letterSpacing: 1}}>
            BLOTTER / INCIDENT REPORT
          </Typography>
        </Box>

        {/* Incident Details (Date, Time, Place) */}
        <Grid container sx={{ borderBottom: '2px solid black' }}> 
          <Grid item xs={6} sx={{ p: 2, borderRight: '2px solid black' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              DATE & TIME OF INCIDENT
            </Typography>
            <Typography variant="body1">
              {reportData.incidentDate} at {reportData.incidentTime}
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              PLACE OF INCIDENT
            </Typography>
            <Typography variant="body1">
              {reportData.incidentPlace}
            </Typography>
          </Grid>
        </Grid>

        {/* Narrative Section */}
        <Box sx={{ p: 2, minHeight: '300px' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            NARRATIVE OF INCIDENT / COMPLAINT:
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {reportData.narrative}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ border: '1px solid black', mt: 2, height: 100 }}>
        <Grid container wrap="nowrap"> 
          {/* Box 1: Reportee */}
          <Grid item xs={4} sx={{ p: 1, borderRight: '1px solid black', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: "33.33%" }}>
            <Typography sx={{ fontSize: '10px', fontStyle: 'italic', lineHeight: 1.1 }}>
              Details stated above are true and correct to the best of my knowledge and belief.
            </Typography>
            <Box sx={{ textAlign: 'center', pb: 1 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid black', display: 'inline-block', px: 1 }}>
                {reportData.fullName}
              </Typography>
              <Typography sx={{ fontSize: '10px', display: 'block' }}>Reportee</Typography>
            </Box>
          </Grid>

          {/* Box 2: Recorded By (Dynamic Secretary) */}
          <Grid item xs={4} sx={{ p: 1, borderRight: '1px solid black', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: "33.33%" }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>RECORDED BY:</Typography>
            <Box sx={{ textAlign: 'center', pb: 1 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '12px', borderBottom: '1px solid black', display: 'inline-block', px: 1, textTransform: 'uppercase' }}>
                {barangaySecretary}
              </Typography>
              <Typography sx={{ fontSize: '10px', mt: 0.5 }}>Barangay Secretary</Typography>
            </Box>
          </Grid>

          {/* Box 3: Received and Filed (Dynamic Captain) */}
          <Grid item xs={4} sx={{ p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: "33.33%" }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>RECEIVED AND FILED:</Typography>
            <Box sx={{ textAlign: 'center', pb: 1 }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '12px', borderBottom: '1px solid black', display: 'inline-block', px: 1, textTransform: 'uppercase' }}>
                {punongBarangay}
              </Typography>
              <Typography sx={{ fontSize: '10px', mt: 0.5 }}>Punong Barangay</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Final Footer Line */}
      <Box sx={{ mt: 1, pt: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'gray' }}>
          This is an official document generated via the Barangay E-Services System.
        </Typography>
      </Box>
      <footer style={{ width: '100%', marginTop: 0.2, paddingBottom: '10px' }}>
            <hr style={{ height: '2px', backgroundColor: 'black', border: 'none', marginBottom: 5 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#444" }}>
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
    </Box>
  );
};

export default IncidentReport;