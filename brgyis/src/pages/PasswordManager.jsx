import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Chip,
  Divider
} from "@mui/material";
import AdminSideBar from "../components/AdminSideBar";

const PasswordManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingToken, setProcessingToken] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/admin/reset-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check your console: make sure 'email' is in the objects!
      console.log("RESPONSE DATA:", res.data); 
      setRequests(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (tokenValue) => {
    setProcessingToken(tokenValue);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/api/admin/reset-approve/${tokenValue}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to approve request");
    } finally {
      setProcessingToken(null);
    }
  };

  const getStatusChip = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "approved": return <Chip label="Approved" color="success" size="small" />;
      case "pending": return <Chip label="Pending" color="warning" size="small" />;
      case "used": return <Chip label="Used" color="default" size="small" />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <AdminSideBar/>
      <div id="header">
        <Box sx={{mx: 10, mb:6}}>
          <h4>Barangay Joyao Joyao Information System</h4>
          <h5>Barangay Joyao Joyao, Numancia, Aklan, Philippines</h5>
          <h5>v1.0.0</h5>
        </Box>
      </div>
      <Paper elevation={4} sx={{ p: 3, ml: 10, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Password Reset Management
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Manage and approve user password reset requests
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Table sx={{overflowY: "auto"}}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No reset requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.userid}</TableCell>
                    {/* UPDATED: Matches the 'email' column from your DB */}
                    <TableCell>{req.email || "N/A"}</TableCell> 
                    <TableCell>{getStatusChip(req.status)}</TableCell>
                    <TableCell>
                      {new Date(req.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {req.status === "pending" ? (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleApprove(req.token)}
                          disabled={processingToken === req.token}
                        >
                          {processingToken === req.token ? (
                            <CircularProgress size={18} />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          COMPLETED
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default PasswordManager;