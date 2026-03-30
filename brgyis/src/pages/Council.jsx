import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress
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

  // Fetch all necessary data
  const fetchAllData = async () => {
    try {
      const [adminRes, councilRes] = await Promise.all([
        axios.get("http://localhost:3001/api/users/admins"),
        axios.get("http://localhost:3001/api/council/all") 
      ]);
      setAdmins(adminRes.data || []);
      setCouncilMembers(councilRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger]);

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
      await axios.post("http://localhost:3001/api/council/add", {
        ...formData,
        is_active: formData.is_active ? 1 : 0,
      });

      alert("Council member added successfully!");
      setFormData({ userid: "", name: "", role: "", is_active: true });
      setSelectedUser("");
      setRefreshTrigger(prev => prev + 1); 
    } catch (err) {
      alert(err.response?.data?.error || "Error adding member");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await axios.put(`http://localhost:3001/api/council/update-status/${id}`, {
        is_active: newStatus
      });
      setRefreshTrigger(prev => prev + 1); 
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // Handle Loading State
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Council Management...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSideBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        
        {/* Organizational Chart - Forces re-render on refreshTrigger change */}
        <OrganizationalChart key={refreshTrigger} />

        <Container maxWidth="md">
          <Grid container spacing={4}>
            
            {/* Admission Form Section */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Council Admission
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        select fullWidth label="Select Admin User"
                        value={selectedUser} onChange={handleUserChange}
                      >
                        {admins.map((user) => (
                          <MenuItem key={user.userid} value={user.userid}>
                            {user.user_name} ({user.email_ad})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="User ID" value={formData.userid} slotProps={{ input: { readOnly: true } }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Name" value={formData.name} slotProps={{ input: { readOnly: true } }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select fullWidth label="Role" name="role"
                        value={formData.role} onChange={handleChange}
                      >
                        <MenuItem value="Punong Barangay">Punong Barangay</MenuItem>
                        <MenuItem value="SB Member">SB Member</MenuItem>
                        <MenuItem value="SK Chairman">SK Chairman</MenuItem>
                        <MenuItem value="Barangay Secretary">Barangay Secretary</MenuItem>
                        <MenuItem value="Barangay Treasurer">Barangay Treasurer</MenuItem>
                        <MenuItem value="Barangay Clerk">Barangay Clerk</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Checkbox checked={formData.is_active} onChange={handleChange} name="is_active" />}
                        label="Set as Active Member"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained" fullWidth size="large"
                        onClick={handleSubmit} disabled={!formData.userid || !formData.role}
                      >
                        Add to Council
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Management Table Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                Council Member List & Status
              </Typography>
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                      <TableCell align="right"><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {councilMembers.length > 0 ? (
                      councilMembers.map((m) => (
                        <TableRow key={m.council_id}>
                          <TableCell>{m.name}</TableCell>
                          <TableCell>{m.role}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={m.is_active ? "Active" : "Inactive"} 
                              color={m.is_active ? "success" : "default"}
                              variant={m.is_active ? "filled" : "outlined"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button 
                              variant="outlined" size="small"
                              color={m.is_active ? "error" : "primary"}
                              onClick={() => toggleStatus(m.council_id, m.is_active)}
                            >
                              {m.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No records found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Council;