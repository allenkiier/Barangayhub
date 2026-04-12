import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Container,
  Typography,
  Divider,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import UserSideBar from "../components/UserSideBar";
import PersonIcon from '@mui/icons-material/Person';

const Profiling = () => {
  const [formData, setFormData] = useState({
    userid: "",
    user_name: "",
    email_ad: "",
    civil_status: "",
    sex: "",
    birthplace: "",
    birthdate: "",
    contact_no: "",
    isPWD: 0,
    isSenior: 0,
    barangay_id: "",
    national_id: "",
    house_no: "",
    street: "",
    barangay: "",
    municipality: "",
    zip_code: "",
    province: "",
    residence_start_date: "",
  });

  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", 
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userid = storedUser?.userid;

    if (!userid) return;

    fetch(`/api/user/${userid}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          ...data,
          userid,
        }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/user/${formData.userid}/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSnackbar({
        open: true,
        message: data.message || "Profile updated successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Error updating profile",
        severity: "error",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex" }} className="profile-page">
      <UserSideBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom fullWidth sx={{color: '#060745'}}>
            <PersonIcon sx={{fontSize: 40, marginRight: 2}}/>
            Profile Information
        </Typography>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
            <Grid item xs={8} sx={{textAlign: 'left'}}>
              <TextField
                sx={{ width: '400px' }}
                size="small"
                label="Full Name"
                name="user_name"
                value={formData.user_name || ""}
                onChange={handleChange}
              />
            </Grid>
            <Divider textAlign="center" sx={{ my: 2 }}>
              CONTACT INFORMATION
            </Divider>

          <Grid container spacing={3}>
            {/* --- SECTION: CONTACT --- */}

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                name="email_ad"
                value={formData.email_ad || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Contact Number"
                name="contact_no"
                value={formData.contact_no || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="National ID"
                name="national_id"
                value={formData.national_id || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}></Grid>
            {/* --- SECTION: BIO --- */}
            
            <Divider textAlign="center" sx={{ my: 2 }}>
              PERSONAL BIO
            </Divider>

            <Grid item xs={12} md={3} spacing={3} sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
              <TextField
                sx={{width: "100px"}}
                size="small"
                label="Sex"
                name="sex"
                value={formData.sex || ""}
                onChange={handleChange}
              />

              <TextField
                sx={{width: "170px"}}
                size="small"
                type="date"
                label="Birthdate"
                name="birthdate"
                InputLabelProps={{ shrink: true }}
                value={formData.birthdate || ""}
                onChange={handleChange}
              />

              <TextField
                sx={{width: "300px"}}
                size="small"
                label="Birthplace"
                name="birthplace"
                value={formData.birthplace || ""}
                onChange={handleChange}
              />
              <TextField
                sx={{width: "200px"}}
                size="small"
                label="Civil Status"
                name="civil_status"
                value={formData.civil_status || ""}
                onChange={handleChange}
              />
            </Grid>
      

           <Divider textAlign="center" sx={{ my: 2 }}>
              RESIDENTIAL INFORMATION
            </Divider>

            {/* Row 4: Residence Date Started */}
            <Grid item xs={12} md={6} >
              <TextField
                sx={{width:"200px", marginBottom: 2}}
                size="small"
                type="date"
                label="Residence Date Started"
                name="residence_start_date"
                InputLabelProps={{ shrink: true }}
                value={formData.residence_start_date || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                <TextField
                  sx={{width: "150px"}}
                  size="small"
                  label="House No"
                  name="house_no"
                  value={formData.house_no || ""}
                  onChange={handleChange}
                />
                <TextField
                  sx={{width: "200px"}}
                  size="small"
                  label="Street"
                  name="street"
                  value={formData.street || ""}
                  onChange={handleChange}
                />
                 <TextField
                  sx={{width: "150px"}}
                  size="small"
                  label="Barangay"
                  name="barangay"
                  value={formData.barangay || ""}
                  onChange={handleChange}
                />
                <TextField
                  sx={{width: "150px"}}
                  size="small"
                  label="Municipality"
                  name="municipality"
                  value={formData.municipality || ""}
                  onChange={handleChange}
                />
                <TextField
                  sx={{width: "100px"}}
                  size="small"
                  label="Province"
                  name="province"
                  value={formData.province || ""}
                  onChange={handleChange}
                />
              
            </Grid>

            {/* --- SECTION: STATE --- */}
            <Divider textAlign="center" sx={{ my: 2 }}>
              SPECIAL STATUS
            </Divider>

            {/* Row 6: PWD & Senior Citizen */}
            <Grid item xs={12} sx={{ display: 'flex', gap: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPWD === 1}
                    onChange={handleChange}
                    name="isPWD"
                  />
                }
                label="Is PWD?"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isSenior === 1}
                    onChange={handleChange}
                    name="isSenior"
                  />
                }
                label="Is Senior Citizen?"
              />
            </Grid>

            {/* Row 7: Submit Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                type="submit" 
                size="large"
                fullWidth
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Save / Update Profile
              </Button>
            </Grid>
          </div>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default Profiling;