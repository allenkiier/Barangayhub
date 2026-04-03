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

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this member?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`http://localhost:3001/api/council/delete/${id}`);

    alert("Deleted successfully!");

    // refresh table
    setRefreshTrigger(prev => prev + 1);

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Delete failed");
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
    <Box sx={{ display: 'flex', pl: 20}}>
      <AdminSideBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <OrganizationalChart key={refreshTrigger} />

        <Container fullWidth>
          <Grid container spacing={4} sx={{display: "flex", flexDirection: "column"}}>
            
            {/* Admission Form Section */}
            <Grid item xs={12} sx={{ p: 2, width: "100%"}}>
              <Box
                sx={{
                  width: "100%",      
                  ml: "auto",

                }}
              >
                <Card
                  elevation={0}      
                  sx={{
                    backgroundColor: "transparent", // 🔥 invisible background
                    boxShadow: "none"                // 🔥 no shadow at all
                  }}
                >
                  <CardContent sx={{ p: 0 }}> {/* optional: remove padding */}
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: "#060745" }}>
                      Council Admission
                    </Typography>

                    <Grid container spacing={2} sx={{display: "flex", flexDirection: "column"}}>
                      <Grid item xs={12}>
                        <TextField
                          select sx={{width: "70%"}} label="Select Admin User"
                          value={selectedUser} onChange={handleUserChange}
                        >
                          {admins.map((user) => (
                            <MenuItem key={user.userid} value={user.userid}>
                              {user.user_name} ({user.email_ad})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sx={{display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 2}}>
                        <TextField
                          sx={{width: "30%"}} 
                          label="User ID"
                          value={formData.userid}
                          slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                          sx={{width: "40%"}}
                          label="Name"
                          value={formData.name}
                          slotProps={{ input: { readOnly: true } }}
                        />
                         <TextField
                          select sx={{width: "30%"}} label="Role" name="role"
                            value={formData.role} onChange={handleChange}>
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
                      </Grid> 
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          sx={{backgroundColor: "#060745", color: "white"}}
                          onClick={handleSubmit}
                          disabled={!formData.userid || !formData.role}
                        >
                          Add to Council
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            {/* Management Table Section */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2, fontWeight: 'bold', color: "#060745"}}>
                Council Member List & Status
              </Typography>
              <TableContainer component={Paper} elevation={2}  fullWidth p={5}>
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
                        <TableRow key={m.council_id} sx={{ '&:hover': { backgroundColor: 'lightgray' }, p: 1}}>
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
                            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                <Button 
                                  variant="outlined"
                                  size="small"
                                  color={m.is_active ? "error" : "primary"}
                                  onClick={() => toggleStatus(m.council_id, m.is_active)}
                                >
                                  {m.is_active ? "Deactivate" : "Activate"}
                                </Button>

                                <Button
                                  variant="contained"
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(m.council_id)}
                                >
                                  Delete
                                </Button>
                              </Box>
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