import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, CircularProgress, Typography, MenuItem
} from "@mui/material";

const BrgyIDRequest = ({ open, onClose, serviceName }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [appType, setAppType] = useState("new");

  const [formData, setFormData] = useState({
    name: "",
    sex: "",
    birthdate: "",
    birthplace: "",
    house_no: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",

    weight: "",
    height: "",
    blood_type: "",
    contact_person: "",
    contact_person_no: ""
  });

  const [userid, setUserid] = useState(null);

  // ================= GET USER =================
  useEffect(() => {
    if (open) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const uid = storedUser?.userid;

      if (!uid) {
        alert("User not logged in");
        return;
      }

      setUserid(uid);
      setLoading(true);

      fetch(`http://localhost:3001/api/user/${uid}`)
        .then(res => res.json())
        .then(data => {
          setFormData(prev => ({
            ...prev,
            name: data.user_name,
            sex: data.sex,
            birthdate: data.birthdate,
            birthplace: data.birthplace,
            house_no: data.house_no,
            street: data.street,
            barangay: data.barangay,
            municipality: data.municipality,
            province: data.province
          }));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [open]);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!userid) {
      alert("Missing user ID");
      return;
    }

    if (!appType) {
      alert("Please select application type");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/api/brgyid/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userid,
          app_type: appType, // ✅ added
          weight: formData.weight,
          height: formData.height,
          blood_type: formData.blood_type,
          contact_person: formData.contact_person,
          contact_person_no: formData.contact_person_no
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(`✅ Submitted!\nTransaction ID: ${data.transaction_id}`);
      onClose();

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI =================
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{serviceName || "Barangay ID Request"}</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{display: "flex", flexDirection:"column", marginTop: 2}}>

            {/* APPLICATION TYPE */}
            <Grid item xs={12}>
              <TextField
                select
                sx={{width: "40%"}}
                label="Application Type"
                value={appType}
                onChange={(e) => setAppType(e.target.value)}
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="renew">Renew</MenuItem>
                <MenuItem value="replacement">Reissuance (lost or damaged)</MenuItem>
              </TextField>
            </Grid>

            {/* READ ONLY */}
            <Grid item xs={8}>
              <TextField sx={{width: "40%"}} label="Full Name" value={formData.name} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={5} sx={{display: "flex", flexDirection:"row", justifyContent: "start", gap: 3}}>
              <TextField sx={{width: "20%"}} label="Sex" value={formData.sex} InputProps={{ readOnly: true }} />
              <TextField sx={{width: "20%"}} label="Birthdate" value={formData.birthdate} InputProps={{ readOnly: true }} />
              <TextField sx={{width: "30%"}} label="Birthplace" value={formData.birthplace} InputProps={{ readOnly: true }} />
            </Grid>


            <Grid item xs={3}>
              <Typography variant="subtitle2">Address</Typography>
            </Grid>

            <Grid item xs={4} sx={{display: "flex", justifyContent: "start", gap: 3}}>
              <TextField sx={{width: "15%"}} label="House No." value={formData.house_no} InputProps={{ readOnly: true }} />
              <TextField sx={{width: "25%"}} label="Street" value={formData.street} InputProps={{ readOnly: true }} />
              <TextField sx={{width: "25%"}} label="Barangay" value={formData.barangay} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={4} sx={{display: "flex", justifyContent: "start", gap: 3}}>
              <TextField sx={{width: "35%"}} label="Municipality" value={formData.municipality} InputProps={{ readOnly: true }} />
              <TextField sx={{width: "35%"}} label="Province" value={formData.province} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={4}>
              <Typography variant="subtitle2">Fill-Ups</Typography>
            </Grid>
            {/* USER INPUT */}
            <Grid item xs={6} sx={{display: "flex", justifyContent: "start", gap: 3}}>
              <TextField sx={{width: "30%"}} label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
              <TextField sx={{width: "30%"}} label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
              <TextField sx={{width: "30%"}} label="Blood Type" name="blood_type" value={formData.blood_type} onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2">Contact Person</Typography>
            </Grid>

            <Grid item xs={6} sx={{display: "flex", justifyContent: "start", gap: 3}}>
              <TextField sx={{width: "40%"}} label="Emergency Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} />
              <TextField sx={{width: "30%"}} label="Contact Person Number" name="contact_person_no" value={formData.contact_person_no} onChange={handleChange} />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{marginBottom: 2, marginRight: 3}}>
        <Button onClick={onClose} sx={{color: "#060745"}}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{background: "#060745"}}
          disabled={loading || submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrgyIDRequest;