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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => setSnack({ ...snack, open: false });

  // ================= FETCH DATA (Unified Endpoint) =================
  const fetchRequests = useCallback(async () => {
    try {
      // Use the token for authentication as per your backend requirements
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/api/admin/requests`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("API endpoint not found (404)");
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json();
      
      // Since the backend 'UNION ALL' query already provides the correct 
      // structure (id, user_name, email_ad, type), we just set it.
      setRequests(data);
    } catch (err) {
      console.error(err);
      showSnack(err.message, "error");
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
      const { id, type } = selectedRequest; // 'type' is 'admin' or 'resident' from backend
      let endpoint = "";

      if (actionType === "approve") {
        endpoint = type === 'admin' 
          ? `${API_URL}/api/approve-admin/${id}` 
          : `${API_URL}/api/approve-resident/${id}`;
      } else {
        endpoint = type === 'admin' 
          ? `${API_URL}/api/reject-admin/${id}` 
          : `${API_URL}/api/reject-resident/${id}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed to ${actionType} request`);

      showSnack(result.message || `Successfully processed request!`, "success");
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
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: "rgba(255,255,255,0.9)" }}>
              <Typography color="text.secondary">No pending requests at the moment.</Typography>
            </Paper>
          ) : (
            requests.map((req) => {
              const isAdminReq = req.type === 'admin';
              return (
                <Paper
                  key={`${req.type}-${req.id}`}
                  elevation={2}
                  sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 2 }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: isAdminReq ? "#f57c00" : "#060745" }}>
                      {isAdminReq ? <ShieldIcon /> : <PersonIcon />}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight="bold" variant="subtitle1">{req.user_name}</Typography>
                        <Chip 
                          label={isAdminReq ? "ADMIN ACCESS" : "RESIDENT"} 
                          size="small"
                          sx={{ 
                            height: '20px', fontSize: '0.65rem', fontWeight: 'bold',
                            bgcolor: isAdminReq ? "#fff3e0" : "#e8f5e9",
                            color: isAdminReq ? "#e65100" : "#2e7d32"
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
              );
            })
          )}
        </Stack>
      </Box>

      {/* Confirmation Dialog */}
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

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminRequest;