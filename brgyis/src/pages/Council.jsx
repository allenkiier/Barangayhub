import React, { useEffect, useState } from "react";
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

  const [formData, setFormData] = useState({
    userid: "",
    name: "",
    role: "",
    is_active: true,
  });

  // ✅ Snackbar
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  // ✅ Confirm Delete Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/council/delete/${selectedDeleteId}`);
      showSnack("Deleted successfully");
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      showSnack(err.response?.data?.error || "Delete failed", "error");
    } finally {
      setConfirmOpen(false);
      setSelectedDeleteId(null);
    }
  };

  // ✅ Fetch Data
  const fetchAllData = async () => {
    try {
      const [adminRes, councilRes] = await Promise.all([
        api.get("/api/users/admins"),
        api.get("/api/council/all")
      ]);

      setAdmins(adminRes.data || []);
      setCouncilMembers(councilRes.data || []);
    } catch (err) {
      showSnack("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, );

  // ✅ Select User
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

  // ✅ Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Add Member
  const handleSubmit = async () => {
    try {
      await api.post("/api/council/add", {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
      });

      showSnack("Council member added successfully");

      setFormData({ userid: "", name: "", role: "", is_active: true });
      setSelectedUser("");
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      showSnack(err.response?.data?.error || "Error adding member", "error");
    }
  };

  // ✅ Toggle Status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;

      await api.put(
        `/api/council/update-status/${id}`,
        { is_active: newStatus }
      );

      showSnack("Status updated");
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      showSnack("Failed to update status", "error");
    }
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Council Management...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', pl: 20 }}>
      <AdminSideBar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <OrganizationalChart key={refreshTrigger} />

        <Container fullWidth>
          <Grid container spacing={4} sx={{ display: "flex", flexDirection: "column" }}>

            {/* FORM */}
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#060745" }}>
                Council Admission
              </Typography>

              <Grid container spacing={2} direction="column">

                <TextField
                  select
                  label="Select Admin User"
                  value={selectedUser}
                  onChange={handleUserChange}
                  sx={{ width: "70%" }}
                >
                  {admins.map((user) => (
                    <MenuItem key={user.userid} value={user.userid}>
                      {user.user_name} ({user.email_ad})
                    </MenuItem>
                  ))}
                </TextField>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField sx={{width: "10%"}} label="User ID" value={formData.userid} InputProps={{ readOnly: true }} />
                  <TextField sx={{width: "20%"}} label="Name" value={formData.name} InputProps={{ readOnly: true }} />

                  <TextField
                    select
                    sx={{width: "40%"}}
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

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.is_active}
                        onChange={handleChange}
                        name="is_active"
                      />
                    }
                    label="Active"
                  />
                </Box>

                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#060745" }}
                  onClick={handleSubmit}
                  disabled={!formData.userid || !formData.role}
                >
                  Add to Council
                </Button>
              </Grid>
            </Grid>

            {/* TABLE */}
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: "#060745" }}>
                Council Member List
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Action</TableCell>
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
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => toggleStatus(m.council_id, m.is_active)}
                          >
                            {m.is_active ? "Deactivate" : "Activate"}
                          </Button>

                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(m.council_id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* ✅ CONFIRM DELETE DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this council member?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={handleCloseSnack}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Council;