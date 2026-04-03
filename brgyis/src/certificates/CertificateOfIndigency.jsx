import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import CallIcon from '@mui/icons-material/Call';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const CertificateOfIndigency = ({ request, officials}) => {
  const { transactionId: urlId } = useParams(); 
  const transactionId = request?.transaction_id || urlId;
  const punongBarangay = officials?.find(o => o.role === 'Punong Barangay')?.name || "  ";

  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/indigency/${transactionId}`)
      .then(res => res.json())
      .then(data => {
        console.log("CERT DATA:", data);
        setCertData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching indigency data:", err);
        setLoading(false);
      });
  }, [transactionId]);

  if (!transactionId || loading || !certData) {
    return <Box sx={{ p: 10, textAlign: 'center', bgcolor: 'white', width: '210mm', height: '297mm' }}>Loading...</Box>;
  }

  return (
    /* REMOVED min-h-screen and py-10 from here to prevent layout shifts */
    <div className="print:block" style={{ backgroundColor: 'white' }}>
      <div 
        className="relative text-gray-900 font-serif overflow-hidden print:m-0"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "20mm 25mm", 
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white"
        }}
      >
        {/* HEADER */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
            <div style={{display: "flex", justifyContent: "center", gap: 20, marginBottom: 15}}>
              <img src='/bryimg.png' alt='logo' style={{width: 80, height: 80}}/>
              <img src='/bago.png' alt='logo' style={{width: 80, height: 80}} />
            </div>
            <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>Republic of the Philippines</Typography>
            <Typography variant="body2">Province of {certData.province}</Typography>
            <Typography variant="body2">Municipality of {certData.municipality}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#060745'}}>
                BARANGAY {certData.barangay?.toUpperCase()}
            </Typography>
            <hr style={{ height: '3px', backgroundColor: '#060745', border: 'none', margin: '10px 0' }} />
            <Typography style={{ fontFamily: "'Old English Text MT', serif", fontSize: '24px', color: '#060745' }}>
                Office of the Punong Barangay
            </Typography>
        </Box>

        {/* TITLE */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              CERTIFICATE OF INDIGENCY
            </Typography>
        </Box>

        {/* BODY */}
        <Box sx={{ flexGrow: 1, fontSize: '18px', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '25px' }}>To Whom It May Concern:</p>
            
            <p className="text-justify" style={{ textIndent: '50px', marginBottom: '20px' }}>
              This is to certify that <span style={{ fontWeight: 900, textTransform: "uppercase" }}>{certData.user_name}</span>, 
              <span style={{ fontWeight: 900 }}> {certData.age} years old</span>, 
              <span style={{ fontWeight: 900 }}> {certData.sex}</span>, 
              <span style={{ fontWeight: 900 }}> {certData.civil_status}</span> and 
              a resident of {certData.house_no} {certData.street}, Barangay {certData.barangay}, {certData.municipality}, {certData.province} belongs to the indigent families of this barangay.
            </p>
            
            <p className="text-justify" style={{ textIndent: '50px', marginBottom: '20px' }}>
              This certification is issued upon the request of the above-mentioned name for whatever legal purpose it may serve.
            </p>

            <p className="text-justify" style={{ textIndent: '50px' }}>
              Issued this <span className="font-bold">{certData.date_issued}</span> at Barangay {certData.barangay}, {certData.municipality}, {certData.province}, Philippines.
            </p>

            {/* SIGNATURE AREA */}
            <div style={{ marginTop: '80px', display: "flex", justifyContent: "flex-end" }}>
                <div style={{ textAlign: "center", width: "200px" }}>
                  <p style={{ fontWeight: 900, borderBottom: '1px solid black', textTransform: 'uppercase' }}>
                    {punongBarangay}
                  </p>
                  <p style={{fontSize:14}}>Punong Barangay</p>
                </div>
            </div>
        </Box>

        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'gray', pl: "70px"}}>
          This is an official document generated via the Barangay E-Services System.
        </Typography>
        <footer style={{ width: '100%' }}>
          <hr style={{ height: '2px', backgroundColor: '#060745', border: 'none', marginBottom: 10 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#444" }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontWeight: 'bold' }}>Joyao-Joyao Multi Purpose-Hall</p>
              <p>Numancia 5604, Aklan Philippines</p>
              <p><b>Amount: None </b></p>
              <p><b>App Type:</b> {certData?.app_type || "N/A"}</p>
              <p><b>B.R. No:</b> {certData?.transaction_id || "N/A"}</p>
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

export default CertificateOfIndigency;