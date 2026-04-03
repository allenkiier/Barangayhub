import React, { useEffect, useState } from "react";
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
  Button
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

const AdminRequest = () => {
  const [requests, setRequests] = useState([]);

  // ✅ CONFIRM STATE
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // approve or reject
  const [selectedId, setSelectedId] = useState(null);

  // ================= FETCH =================
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/admin/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      const data = text ? JSON.parse(text) : [];
      setRequests(data);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ================= OPEN CONFIRM =================
  const handleOpenConfirm = (id, type) => {
    setSelectedId(id);
    setActionType(type);
    setConfirmOpen(true);
  };

  // ================= CONFIRM ACTION =================
  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      const endpoint =
        actionType === "approve"
          ? `/api/admin/approve/${selectedId}`
          : `/api/admin/reject/${selectedId}`;

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      await fetchRequests();
    } catch (err) {
      console.error(`${actionType} error:`, err.message);
    } finally {
      setConfirmOpen(false);
      setSelectedId(null);
      setActionType("");
    }
  };

  // ================= UI =================
  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Admission Requests
        </Typography>

        <Stack spacing={2}>
          {requests.length === 0 ? (
            <Typography>No pending requests</Typography>
          ) : (
            requests.map((req) => (
              <Paper
                key={req.userid}
                elevation={3}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* LEFT */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>

                  <Box>
                    <Typography fontWeight="bold">
                      {req.user_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {req.email_ad}
                    </Typography>
                  </Box>
                </Box>

                {/* RIGHT */}
                <Box>
                  <IconButton
                    color="success"
                    onClick={() => handleOpenConfirm(req.userid, "approve")}
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

      {/* ✅ CONFIRM DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {actionType === "approve" ? "Approve Request" : "Reject Request"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to{" "}
            <b>{actionType}</b> this admission request?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === "approve" ? "success" : "error"}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminRequest;