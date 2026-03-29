import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Container,
  Typography,
  Box,
  Grid
} from "@mui/material";

const Profiling = () => {
  const [formData, setFormData] = useState({
    userid: "",
    user_name: "",
    email_ad: "",
    civil_status: "",
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
    residence_start_date: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userid = storedUser?.userid;

    if (!userid) return;

    fetch(`http://localhost:3001/api/user/${userid}`)
      .then(res => res.json())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          ...data,
          userid
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      alert(data.message);
    } catch (err) {
      console.error("Submit error:", err.message);
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Profiling
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            {/* Credentials */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Username"
                name="user_name"
                value={formData.user_name || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                name="email_ad"
                value={formData.email_ad || ""}
                onChange={handleChange}
              />
            </Grid>

            {/* Profile Info */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Civil Status"
                name="civil_status"
                value={formData.civil_status || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Contact Number"
                name="contact_no"
                value={formData.contact_no || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Barangay ID"
                name="barangay_id"
                value={formData.barangay_id || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="National ID"
                name="national_id"
                value={formData.national_id || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label="House No"
                name="house_no"
                value={formData.house_no || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label="Street"
                name="street"
                value={formData.street || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label="Barangay"
                name="barangay"
                value={formData.barangay || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label="Municipality"
                name="municipality"
                value={formData.municipality || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Zip Code"
                name="zip_code"
                value={formData.zip_code || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Province"
                name="province"
                value={formData.province || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Residence Start Date"
                name="residence_start_date"
                value={formData.residence_start_date || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Checkboxes */}
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPWD === 1}
                    onChange={handleChange}
                    name="isPWD"
                  />
                }
                label="PWD"
              />
            </Grid>

            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isSenior === 1}
                    onChange={handleChange}
                    name="isSenior"
                  />
                }
                label="Senior Citizen"
              />
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button variant="contained" type="submit" fullWidth>
                Save / Update Profile
              </Button>
            </Grid>

          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default Profiling;