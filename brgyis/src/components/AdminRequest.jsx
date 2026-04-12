import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

// Using the Railway variable or falling back to local for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminRequest = () => {
  const [requests, setRequests] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // approve or reject
  const [selectedId, setSelectedId] = useState(null);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ================= NOTIFICATION HELPER =================
  const showSnack = useCallback((message, severity = "success") => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  // ================= FETCH DATA =================
  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_URL}/api/admin/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch requests");
      }

      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Fetch error:", err.message);
      showSnack("Error loading requests: " + err.message, "error");
    }
  }, [showSnack]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ================= ACTIONS =================
  const handleOpenConfirm = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      // Construct the absolute URL correctly
      const endpoint =
        actionType === "approve"
          ? `${API_URL}/api/admin/approve/${selectedId}`
          : `${API_URL}/api/admin/reject/${selectedId}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to ${actionType} request`);
      }

      showSnack(`Successfully ${actionType}d the request!`, "success");
      await fetchRequests(); // Refresh the list
    } catch (err) {
      console.error(`${actionType} error:`, err.message);
      showSnack(err.message, "error");
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
      setActionType("");
    }
  };

  // ================= UI RENDER =================
  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ color: "#060745", fontWeight: "bold", mb: 4 }}
        >
          Admission Requests
        </Typography>

        <Stack spacing={2}>
          {requests.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">
                No pending admission requests at the moment.
              </Typography>
            </Paper>
          ) : (
            requests.map((req) => (
              <Paper
                key={req.userid}
                elevation={2}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 2,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6 }
                }}
              >
                {/* User Info Section */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "#060745" }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold" variant="subtitle1">
                      {req.user_name || req.name || "Unknown User"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {req.email_ad || req.email || "No email provided"}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons Section */}
                <Box>
                  <IconButton
                    color="success"
                    onClick={() => handleOpenConfirm(req.userid, "approve")}
                    sx={{ mr: 1 }}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleOpenConfirm(req.userid, "reject")}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))
          )}
        </Stack>
      </Box>

      {/* ACTION CONFIRMATION MODAL */}
      <Dialog 
        open={confirmOpen} 
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {actionType === "approve" ? "Approve Admission" : "Reject Admission"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <b>{actionType}</b> this request? 
            This user will be notified of the decision.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            onClick={handleConfirm}
            sx={{ px: 3 }}
          >
            Confirm {actionType}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICATIONS */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnack} 
          severity={snack.severity} 
          variant="filled" 
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminRequest;