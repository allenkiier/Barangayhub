import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserSignRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, type: "", name: "" });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending users");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setSnack({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleAction = async () => {
    const { id, type } = confirmDialog;
    try {
      const token = localStorage.getItem("token");
      const endpoint = type === "approve" 
        ? `${API_URL}/api/admin/approve/${id}` 
        : `${API_URL}/api/admin/reject/${id}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to ${type} user`);

      setSnack({ open: true, message: `User successfully ${type}d!`, severity: "success" });
      fetchPendingUsers();
    } catch (err) {
      setSnack({ open: true, message: err.message, severity: "error" });
    } finally {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#060745">
          Pending Account Approvals
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={fetchPendingUsers} 
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Requested Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No pending requests found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((user) => (
                <TableRow key={user.userid} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: "#060745", width: 32, height: 32 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography fontWeight="500">{user.user_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email_ad}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isAdmin ? "Admin" : "Resident"} 
                      color={user.isAdmin ? "secondary" : "primary"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Approve">
                      <IconButton 
                        color="success" 
                        onClick={() => setConfirmDialog({ open: true, id: user.userid, type: "approve", name: user.user_name })}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton 
                        color="error"
                        onClick={() => setConfirmDialog({ open: true, id: user.userid, type: "reject", name: user.user_name })}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {confirmDialog.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to {confirmDialog.type} the account for <b>{confirmDialog.name}</b>?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
          <Button 
            variant="contained" 
            color={confirmDialog.type === "approve" ? "success" : "error"}
            onClick={handleAction}
          >
            Confirm {confirmDialog.type}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snack.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default UserSignRequest;