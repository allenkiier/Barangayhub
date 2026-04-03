import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import CallIcon from '@mui/icons-material/Call';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const BusinessClearance = ({ request, officials }) => {
  const { transactionId: urlId } = useParams();
  const transactionId = request?.transaction_id || urlId;
  const punongBarangay = officials?.find(o => o.role === 'Punong Barangay')?.name || "  ";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) {
      console.error("❌ No transactionId provided");
      return;
    }

    setLoading(true);

    fetch(`http://localhost:3001/api/business-clearance/${transactionId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [transactionId]);

  if (loading || !data) {
    return (
      <Box
        sx={{
          width: '210mm',
          height: '297mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          margin: 'auto'
        }}
      >
        <Typography>Loading Business Clearance...</Typography>
      </Box>
    );
  }

  const dateIssued = new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(data.created_at));

  const timeIssued = new Date(data.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        `}
      </style>

      <Box
        sx={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          boxSizing: 'border-box',
          backgroundColor: 'white',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          border: '1px solid #ccc',
          '@media print': {
            margin: 0,
            border: 'none',
            width: '210mm',
            height: '297mm'
          }
        }}
      >
        {/* HEADER */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
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
              marginTop: '5px'
            }}
          >
            Office of the Punong Barangay
          </Typography>
        </Box>

        {/* TITLE */}
        <Box 
          sx={{ 
            borderTop: '2px solid black', 
            borderBottom: '2px solid black', 
            p: '2mm', 
            textAlign: 'center', 
            mb: 1 
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            BARANGAY BUSINESS CLEARANCE
          </Typography>
        </Box>

        <Typography sx={{ mb: 2 }}>
          This is to certify that the undersigned hereby approved the herein
          application of:
        </Typography>

        {/* OWNER */}
        <Typography
          align="center"
          sx={{
            fontWeight: 'bold',
            fontSize: '16pt',
            textDecoration: 'underline'
          }}
        >
          {data.user_name?.toUpperCase()}
        </Typography>
        <Typography align="center" variant="caption" sx={{ mb: 3 }}>
          (Business Owner/Manager/Proprietor)
        </Typography>

        {/* TRADE NAME */}
        <Typography>
          For a Business Clearance to operate business of:
        </Typography>
        <Typography
          align="center"
          sx={{
            fontWeight: 'bold',
            fontSize: '14pt',
            textDecoration: 'underline'
          }}
        >
          {data.trade_name?.toUpperCase()}
        </Typography>
        <Typography align="center" variant="caption" sx={{ mb: 3 }}>
          (Business Trade Name)
        </Typography>

        {/* ADDRESS */}
        <Box sx={{ bgcolor: '#f0f0f0', p: '2mm', mb: 1 }}>
          <Typography variant="body2">Located at:</Typography>
        </Box>

        <Typography
          align="center"
          sx={{ fontWeight: 'bold', mb: 3 }}
        >
          {data.business_address?.toUpperCase()}
        </Typography>

        {/* TEXT */}
        <Typography variant="body2" paragraph>
          This certifies that the applicant pledges to abide with laws, rules and
          regulations regarding the said activity and that the same is not a
          nuisance to public order and safety.
        </Typography>

        <Typography>
          This is issued to the applicant for presentation to the Business Permit and Licensing Office, this
          Municipality and all offices and agencies concerned prior to the issuance of any permit regarding
          the said activity pursuant to Republic Act 7160 otherwise known as the Local Government Code
          of 1991.
        </Typography>

        {/* TABLE */}
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            mt: 4
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#d3d3d3' }}>
              <th style={{ border: '1px solid black', padding: '5px' }}>
                Time Issued
              </th>
              <th style={{ border: '1px solid black', padding: '5px' }}>
                Date Issued
              </th>
              <th style={{ border: '1px solid black', padding: '5px' }}>
                Date Expired
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid black', textAlign: 'center' }}>
                {timeIssued}
              </td>
              <td style={{ border: '1px solid black', textAlign: 'center' }}>
                {dateIssued}
              </td>
              <td style={{ border: '1px solid black', textAlign: 'center' }}>
                December 31, {new Date().getFullYear()}
              </td>
            </tr>
          </tbody>
        </Box>

        {/* SIGNATURE */}
        <Box sx={{ mt: 8, textAlign: 'right', pr: 5 }}>
          <Typography sx={{ fontWeight: 'bold' }}>
            {punongBarangay.toUpperCase()}
          </Typography>
          <Typography>Punong Barangay</Typography>
        </Box>

          
          <footer style={{ width: '100%', marginTop: 'auto', paddingBottom: '10px' }}>
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'gray', pl: "70px"}}>
                This is an official document generated via the Barangay E-Services System.
            </Typography>
            <hr style={{ height: '2px', backgroundColor: 'black', border: 'none', marginBottom: 5 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#444" }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontWeight: 'bold' }}>Joyao-Joyao Multi Purpose-Hall</p>
                    <p>Numancia 5604, Aklan Philippines</p>
                    <p><b>Amount:</b> Php 50.00</p>
                    <p><b>App Type:</b> {data?.app_type || "N/A"}</p>
                    <p><b>B.R. No.:</b> {data?.transaction_id || "N/A"}</p>
                  </div>
                  <div style={{ textAlign: "left" }}>
                      <p><FacebookIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Brgy. Joyao-Joyao</p>
                      <p><CallIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> 265-3774</p>
                      <p><MailOutlineIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> blgujoyaojoyao03@gmail.com</p>
                  </div>
            </div>
          </footer>
        
      </Box>
    </>
  );
};

export default BusinessClearance;