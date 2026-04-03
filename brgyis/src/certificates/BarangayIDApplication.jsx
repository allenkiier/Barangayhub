import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';

const BarangayIDApplication = ({ request}) => {
  const transactionId = request?.transaction_id;
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    
    // UPDATED URL: matches your server.js app.get('/api/brgyid/:transaction_id')
    fetch(`http://localhost:3001/api/brgyid/${transactionId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("FORM DATA:", data);
        setFormData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Barangay ID data:", err);
        setLoading(false);
      });
  }, [transactionId]);

  if (loading || !formData) {
    return (
      <Box sx={{ p: 10, textAlign: 'center', bgcolor: 'white', width: '210mm', height: '297mm' }}>
        <Typography>Loading Application Data...</Typography>
      </Box>
    );
  }

  return (
    <div className="print:block" style={{ backgroundColor: 'white' }}>
      <div
        className="relative text-gray-900 font-serif overflow-hidden print:m-0 mx-auto"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "15mm 20mm",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}
      >
        {/* HEADER */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 10 }}>
            <img src='/bryimg.png' alt='logo' style={{ width: 60, height: 60 }} />
            <div style={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>Republic of the Philippines</Typography>
              <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>Province of {formData.province}</Typography>
              <Typography variant="caption" sx={{ display: 'block', lineHeight: 1 }}>Municipality of {formData.municipality}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mt: 0.5 }}>
                BARANGAY {formData.barangay?.toUpperCase()}
              </Typography>
            </div>
            <img src='/bago.png' alt='logo' style={{ width: 60, height: 60 }} />
          </div>
          <hr style={{ height: '2px', backgroundColor: 'black', border: 'none', margin: '5px 0' }} />
          <Typography style={{ fontFamily: "'Old English Text MT', serif", fontSize: '24px', color: '#060745' }}>
                          Office of the Punong Barangay
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#060745"}}>
            APPLICATION FOR BARANGAY IDENTIFICATION CARD
          </Typography>
        </Box>

        {/* FORM CONTENT - Mapping to your DB Column Names */}
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={9} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>COMPLETE NAME :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                {formData.user_name}
              </Typography>
            </Grid>
            <Grid item xs={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>CP#</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>
                {/* Note: In your DB, this likely comes from the user table join or should be in brgyid_req */}
                {formData.contact_person_no} 
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>COMPLETE ADDRESS :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>
                {formData.house_no} {formData.street}, {formData.barangay}, {formData.municipality}
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>DATE OF BIRTH :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>{formData.birthdate}</Typography>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>PLACE OF BIRTH :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>{formData.birthplace}</Typography>
            </Grid>

            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>WEIGHT :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1, textAlign: 'center' }}>{formData.weight}</Typography>
              <Typography sx={{ ml: 1 }}>kls.</Typography>
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>HEIGHT :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1, textAlign: 'center' }}>{formData.height}</Typography>
              <Typography sx={{ ml: 1 }}>mts.</Typography>
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>BLOOD TYPE :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>{formData.blood_type}</Typography>
            </Grid>
            
            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>SEX :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>{formData.sex}</Typography>
            </Grid>
          </Grid>

          {/* EMERGENCY SECTION */}
          <Box sx={{ mt: 6 }}>
            <Typography sx={{ fontWeight: 900, mb: 2 }}>IN CASE OF EMERGENCY</Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>CONTACT PERSON :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>{formData.contact_person}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '70%' }}>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>CONTACT NUMBER :</Typography>
              <Typography sx={{ flexGrow: 1, borderBottom: '1px solid black', px: 1 }}>{formData.contact_person_no}</Typography>
            </Box>
          </Box>

          {/* SIGNATURE/THUMBMARK SPACES */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 10 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 150, height: 100, border: '1px solid black', mb: 1 }}></Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Right Thumbmark</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 200, borderBottom: '1px solid black', mb: 1, mt: 8 }}></Box>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Signature</Typography>
            </Box>
          </Box>
        </Box>

        {/* FOOTER */}
         <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'gray', pl: "70px"}}>
                  This is an official document generated via the Barangay E-Services System.
          </Typography>
        <Box sx={{ borderTop: '2px solid black', pt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ display: 'block' }}>Date Applied: {new Date(formData.created_at).toLocaleDateString()}</Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>B.R. No.: {formData.transaction_id}</Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>Amount: Php 150 </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}> Application Type: {formData?.app_type || "N/A"}</Typography>
          </Box>
          <Box sx={{ border: "1px solid black", width: 250, padding: 2}}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', textAlign: "left" }}>Community Based Monitoring System</Typography>
            <Box sx={{ display: "flex", flexDirection:"row", justifyContent: "space-between"}}> 
              <Typography sx={{fontSize:12}}>HH: {formData.house_no}</Typography>
              <Typography sx={{fontSize:12}}>Individual No: {formData.userid}</Typography>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default BarangayIDApplication;