import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, CircularProgress, Typography
} from "@mui/material";

const BrgyIDRequest = ({ open, onClose, serviceName }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/api/brgyid/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userid,
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{serviceName || "Barangay ID Request"}</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>

            {/* READ ONLY */}
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" value={formData.name} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Sex" value={formData.sex} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Birthdate" value={formData.birthdate} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Birthplace" value={formData.birthplace} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2">Address</Typography>
            </Grid>

            <Grid item xs={4}>
              <TextField fullWidth label="House No." value={formData.house_no} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={8}>
              <TextField fullWidth label="Street" value={formData.street} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Barangay" value={formData.barangay} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Municipality" value={formData.municipality} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Province" value={formData.province} InputProps={{ readOnly: true }} />
            </Grid>

            {/* USER INPUT */}
            <Grid item xs={6}>
              <TextField fullWidth label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Blood Type" name="blood_type" value={formData.blood_type} onChange={handleChange} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Emergency Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Contact Person Number" name="contact_person_no" value={formData.contact_person_no} onChange={handleChange} />
            </Grid>

          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrgyIDRequest;