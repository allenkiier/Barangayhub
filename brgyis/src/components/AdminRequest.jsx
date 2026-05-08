import React, { useEffect, useState, useCallback } from "react";
import {
  Container, Box, Paper, Typography, Avatar, IconButton, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Snackbar, Alert, Chip
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Shield";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminRequest = () => {
  const [requests, setRequests] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null); // Store the whole object

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => setSnack({ ...snack, open: false });

  // ================= FETCH DATA (Both Tables) =================
  const fetchRequests = useCallback(async () => {
    try {
      // Fetch both types of requests in parallel
      const [resAdmins, resResidents] = await Promise.all([
        fetch(`${API_URL}/api/pending-admins`),
        fetch(`${API_URL}/api/pending-residents`)
      ]);

      const admins = await resAdmins.json();
      const residents = await resResidents.json();

      // Normalize data so the UI can render them the same way
      const normalizedAdmins = admins.map(a => ({
        id: a.admin_req_id,
        user_name: a.user_name,
        email_ad: a.email_ad,
        isAdmin: true // Flag for the UI
      }));

      const normalizedResidents = residents.map(r => ({
        id: r.request_id,
        user_name: r.user_name,
        email_ad: r.email_ad,
        isAdmin: false
      }));

      setRequests([...normalizedAdmins, ...normalizedResidents]);
    } catch (err) {
      showSnack("Error loading requests: " + err.message, "error");
    }
  }, [showSnack]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ================= ACTIONS =================
  const handleOpenConfirm = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const { id, isAdmin } = selectedRequest;
      let endpoint = "";

      // Construct endpoint based on Type and Role
      if (actionType === "approve") {
        endpoint = isAdmin 
          ? `${API_URL}/api/approve-admin/${id}` 
          : `${API_URL}/api/approve-resident/${id}`;
      } else {
        endpoint = isAdmin 
          ? `${API_URL}/api/reject-admin/${id}` 
          : `${API_URL}/api/reject-resident/${id}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Failed to ${actionType} request`);

      showSnack(`Successfully ${actionType}d the request!`, "success");
      await fetchRequests(); 
    } catch (err) {
      showSnack(err.message, "error");
    } finally {
      setConfirmOpen(false);
      setSelectedRequest(null);
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Typography variant="h4" gutterBottom sx={{ color: "#060745", fontWeight: "bold", mb: 4 }}>
          Admission Requests
        </Typography>

        <Stack spacing={2}>
          {requests.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">No pending requests at the moment.</Typography>
            </Paper>
          ) : (
            requests.map((req) => (
              <Paper
                key={`${req.isAdmin ? 'adm' : 'res'}-${req.id}`}
                elevation={2}
                sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 2 }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: req.isAdmin ? "#f57c00" : "#060745" }}>
                    {req.isAdmin ? <ShieldIcon /> : <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight="bold" variant="subtitle1">{req.user_name}</Typography>
                      <Chip 
                        label={req.isAdmin ? "ADMIN ACCESS" : "RESIDENT"} 
                        size="small"
                        sx={{ 
                          height: '20px', fontSize: '0.65rem', fontWeight: 'bold',
                          bgcolor: req.isAdmin ? "#fff3e0" : "#e8f5e9",
                          color: req.isAdmin ? "#e65100" : "#2e7d32"
                        }} 
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{req.email_ad}</Typography>
                  </Box>
                </Box>

                <Box>
                  <IconButton color="success" onClick={() => handleOpenConfirm(req, "approve")} sx={{ mr: 1, border: '1px solid #e0e0e0' }}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleOpenConfirm(req, "reject")} sx={{ border: '1px solid #e0e0e0' }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))
          )}
        </Stack>
      </Box>

      {/* MODAL & SNACKBAR (Keep your original code for these) */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
         <DialogTitle>{actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}</DialogTitle>
         <DialogContent>
            Are you sure you want to {actionType} <b>{selectedRequest?.user_name}</b>?
         </DialogContent>
         <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="contained" color={actionType === "approve" ? "success" : "error"} onClick={handleConfirm}>
               Confirm
            </Button>
         </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack}>
        <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminRequest;