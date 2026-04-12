import React, { useEffect, useState, useCallback } from "react";
import api from "../api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import OrganizationalChart from "../components/OrganizationalChart";
import AdminSideBar from "../components/AdminSideBar";

const Council = () => {
  const [admins, setAdmins] = useState([]);
  const [councilMembers, setCouncilMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    userid: "",
    name: "",
    role: "",
    is_active: true,
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // ✅ STABILIZED: showSnack
  const showSnack = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => {
    setSnack((prev) => ({ ...prev, open: false }));
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`${API_URL}/api/council/delete/${selectedDeleteId}`);
      showSnack("Deleted successfully");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showSnack(err.response?.data?.error || "Delete failed", "error");
    } finally {
      setConfirmOpen(false);
      setSelectedDeleteId(null);
    }
  };

  // ✅ STABILIZED: fetchAllData using useCallback to pass the build linter
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [adminRes, councilRes] = await Promise.all([
        api.get(`${API_URL}/api/users/admins`),
        api.get(`${API_URL}/api/council/all`)
      ]);
      setAdmins(adminRes.data || []);
      setCouncilMembers(councilRes.data || []);
    } catch (err) {
      showSnack("Failed to load data", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [showSnack]); // showSnack is now a stable dependency

  // ✅ FIXED: dependency array now includes fetchAllData and refreshTrigger
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, refreshTrigger]);

  const handleUserChange = (e) => {
    const userId = Number(e.target.value);
    const user = admins.find((u) => Number(u.userid) === userId);
    if (!user) return;

    setSelectedUser(userId);
    setFormData((prev) => ({
      ...prev,
      userid: user.userid,
      name: user.user_name,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.post(`${API_URL}/api/council/add`, {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
      });

      showSnack("Council member added successfully");
      setFormData({ userid: "", name: "", role: "", is_active: true });
      setSelectedUser("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showSnack(err.response?.data?.error || "Error adding member", "error");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await api.put(`${API_URL}/api/council/update-status/${id}`, {
        is_active: newStatus,
      });
      showSnack("Status updated");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showSnack("Failed to update status", "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Council Management...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSideBar />

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: "90px" }}>
        <OrganizationalChart key={refreshTrigger} />

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            {/* FORM SECTION */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#060745" }}>
                  Council Admission
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      select
                      fullWidth
                      label="Select Admin User"
                      value={selectedUser}
                      onChange={handleUserChange}
                    >
                      {admins.map((user) => (
                        <MenuItem key={user.userid} value={user.userid}>
                          {user.user_name} ({user.email_ad})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={4} md={2}>
                    <TextField fullWidth label="User ID" value={formData.userid} InputProps={{ readOnly: true }} />
                  </Grid>

                  <Grid item xs={8} md={2}>
                    <TextField fullWidth label="Name" value={formData.name} InputProps={{ readOnly: true }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <MenuItem value="Punong Barangay">Punong Barangay</MenuItem>
                      <MenuItem value="SB Member">SB Member</MenuItem>
                      <MenuItem value="SK Chairman">SK Chairman</MenuItem>
                      <MenuItem value="Barangay Secretary">Barangay Secretary</MenuItem>
                      <MenuItem value="Barangay Treasurer">Barangay Treasurer</MenuItem>
                      <MenuItem value="Barangay Clerk">Barangay Clerk</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={<Checkbox checked={formData.is_active} onChange={handleChange} name="is_active" />}
                      label="Active"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      sx={{ backgroundColor: "#060745", height: "100%" }}
                      onClick={handleSubmit}
                      disabled={!formData.userid || !formData.role}
                    >
                      Add to Council
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* TABLE SECTION */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#060745" }}>
                  Council Member List
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><b>Name</b></TableCell>
                        <TableCell><b>Role</b></TableCell>
                        <TableCell align="center"><b>Status</b></TableCell>
                        <TableCell align="right"><b>Action</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {councilMembers.map((m) => (
                        <TableRow key={m.council_id}>
                          <TableCell>{m.name}</TableCell>
                          <TableCell>{m.role}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={m.is_active ? "Active" : "Inactive"}
                              color={m.is_active ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => toggleStatus(m.council_id, m.is_active)}>
                              {m.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button size="small" color="error" onClick={() => handleDeleteClick(m.council_id)}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* DELETE DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this member from the council?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar 
        open={snack.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={handleCloseSnack} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Council;