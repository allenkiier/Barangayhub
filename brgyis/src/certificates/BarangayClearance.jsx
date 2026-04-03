import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import CallIcon from '@mui/icons-material/Call';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const BarangayClearance = ({ request, officials }) => {
  const { transactionId: urlId } = useParams();
  const transactionId = request?.transaction_id || urlId;
  const punongBarangay = officials?.find(o => o.role === 'Punong Barangay')?.name || "   ";

  const [clearanceData, setClearanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to calculate age if not provided by API
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  useEffect(() => {
    if (!transactionId) return;
    
    setLoading(true);
    // Ensure this URL matches your server.js route
    fetch(`http://localhost:3001/api/clearance/${transactionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("Data:", data);
        // Compute age if the backend doesn't send it
        const finalData = {
          ...data,
          age: data.age || calculateAge(data.birthdate)
        };
        setClearanceData(finalData); // Fixed: matched the state variable name
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [transactionId]);

  if (loading || !clearanceData) {
    return (
      <Box sx={{ p: 10, textAlign: 'center', bgcolor: 'white', width: '210mm', height: '297mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">Loading Clearance Data...</Typography>
      </Box>
    );
  }

  return (
    <div className="print:block" style={{ backgroundColor: 'white' }}>
      <div
        className="relative text-gray-900 font-sans overflow-hidden print:m-0 mx-auto"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "15mm 20mm",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          border: "1px solid #eee"
        }}
      >
        {/* HEADER */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', gap: 20 }}>
            <img src='/bryimg.png' alt='logo' style={{ width: 70, height: 70 }} />
            <div style={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ lineHeight: 1.2 }}>Republic of the Philippines</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.2 }}>Province of Aklan</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.2 }}>Municipality of Numancia</Typography>
              <Typography variant="h6" sx={{ fontSize: 14, fontWeight: 900 }}>BARANGAY JOYAO-JOYAO</Typography>
            </div>
            <img src='bago.png' alt='logo' style={{ width: 80, height: 60 }} />
          </div>
          <Typography 
            style={{ 
              fontFamily: "'Old English Text MT', serif", 
              fontSize: '22px', 
              color: '#060745', 
              marginTop: '3px'
            }}
          >
            Office of the Punong Barangay
          </Typography>
        </Box>

        {/* TITLE */}
        <Box sx={{ textAlign: 'center', py: 0.5, mb: 0, borderTop: "2px solid black"}}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, letterSpacing: 1 }}>
            BARANGAY CLEARANCE
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#d1d5db', px: 1, py: 0.2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            This is to certify that the person whose name, picture and signature appear hereon has requested a CLEARANCE from this office
          </Typography>
        </Box>

        {/* DATA GRID */}
        <Grid container sx={{ borderBottom: '1px solid black' }}>
          <Grid item xs={7} sx={{ p: 2, borderRight: '1px solid black' }}>
            {[
              { label: 'Name', value: clearanceData.user_name },
              { label: 'Address', value: `${clearanceData.address}` },
              { label: 'Age', value: clearanceData.age },
              { label: 'Sex', value: clearanceData.sex },
              { label: 'Civil Status', value: clearanceData.civil_status },
              { label: 'Date of Birth', value: clearanceData.birthdate },
              { label: 'Place of Birth', value: clearanceData.birthplace },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', mb: 0.5 }}>
                <Typography sx={{ width: '110px', fontWeight: 'bold', fontSize: '13px' }}>{item.label}:</Typography>
                <Typography sx={{ fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px dotted #ccc', flexGrow: 1 }}>{item.value}</Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fafafa' }}>
            <Box sx={{ width: '130px', height: '130px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', ml:2}}>
               <Typography variant="caption" color="textSecondary">2X2 PICTURE</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* PURPOSE SECTION */}
        <Box sx={{ bgcolor: '#d1d5db', px: 1, py: 0.2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Purpose:</Typography>
        </Box>
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>{clearanceData.purpose || 'FOR ANY LEGAL PURPOSES'}</Typography>
        </Box>

        {/* SIGNATURE SECTION */}
        <hr style={{ border: '0.5px solid black' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 3, textAlign: 'center' }}>
          <Box>
            <Box sx={{ width: 150, height: 110, border: '1px solid black', mb: 1, mx: 'auto' }}></Box>
            <Box sx={{ bgcolor: '#d1d5db', px: 2 }}><Typography variant="caption" sx={{ fontWeight: 'bold' }}>Signature</Typography></Box>
          </Box>
          <Box>
            <Box sx={{ width: 110, height: 110, border: '1px solid black', borderRadius: '50%', mb: 1, mx: 'auto' }}></Box>
            <Box sx={{ bgcolor: '#d1d5db', px: 2 }}><Typography variant="caption" sx={{ fontWeight: 'bold' }}>Left Thumbmark</Typography></Box>
          </Box>
          <Box>
            <Box sx={{ width: 110, height: 110, border: '1px solid black', borderRadius: '50%', mb: 1, mx: 'auto' }}></Box>
            <Box sx={{ bgcolor: '#d1d5db', px: 2 }}><Typography variant="caption" sx={{ fontWeight: 'bold' }}>Right Thumbmark</Typography></Box>
          </Box>
        </Box>

        {/* CERTIFICATION TEXT */}
        <Box sx={{ px: 1, py: 1 }}>
          <Typography variant="body2" sx={{ textAlign: 'justify', textIndent: '30px' }}>
            This is further to certify that <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{clearanceData.user_name}</span> is known to me of good moral character and is a law-abiding citizen in this community. 
            He/She has no pending case nor derogatory record filed in this office as of this date of issuance.
          </Typography>
        </Box>

        {/* FEES TABLE */}
        <Box sx={{ mt: 2, width: '250px' }}>
          <Box sx={{ bgcolor: '#d1d5db', px: 1, display: 'flex', justifyContent: 'space-between', border: '1px solid black' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Amount Paid:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>₱ 50.00</Typography>
          </Box>
          <Box sx={{ bgcolor: '#d1d5db', px: 1, mt: 0.2, py: 0.5, border: '1px solid black' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>O.R. No.: {clearanceData.transaction_id} </Typography>
          </Box>
        </Box>

        {/* ISSUANCE INFO */}
        <Grid container sx={{ mt: 1, border: '1px solid black', bgcolor: '#d1d5db' }}>
          <Grid item xs={4} sx={{ p: 0.5, borderRight: '1px solid black' }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>Time Issued:</Typography>
            <Typography sx={{ fontSize: '12px' }}>{clearanceData.time_issued || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ p: 0.5, borderRight: '1px solid black' }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>Date Issued:</Typography>
            <Typography sx={{ fontSize: '12px' }}>{new Date().toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ p: 0.5 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>Date Expired:</Typography>
            <Typography sx={{ fontSize: '12px' }}>12/31/2026</Typography>
          </Grid>
        </Grid>

        {/* SIGNATORY */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', mt: 5, pr: 5, mb: 2}}>
          <Box sx={{textAlign: 'center'}}>
            <Typography sx={{ fontWeight: 900, fontSize: '18px'}}>{punongBarangay}</Typography>
            <Typography sx={{ fontSize: '14px'}}>Punong Barangay</Typography>
          </Box>
        </Box>

        <p className="text-justify" style={{ textIndent: '30px', marginBottom: '2px', fontSize: '11px', color: '#555' }}>
              This certification is issued upon the request of the above-mentioned name for whatever legal purpose it may serve.
        </p>
        <footer style={{ width: '100%', marginTop: 'auto', paddingBottom: '10px' }}>
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
      </div>
    </div>
  );
};

export default BarangayClearance;