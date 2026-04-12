import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';

import OpenMessageView from "../modals/OpenMessageView";

const OpenMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // ✅ NEW STATES
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // FETCH
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/open-messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✅ OPEN CONFIRMATION
  const handleConfirmDelete = (id) => {
    setToDelete(id);
    setConfirmOpen(true);
  };

  // ✅ ACTUAL DELETE
  const handleDelete = async () => {
    try {
      const res = await fetch(
        `/api/open-messages/${toDelete}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setMessages((prev) =>
          prev.filter((msg) => msg.open_mess_id !== toDelete)
        );

        setSnackbar({
          open: true,
          message: "Message deleted successfully",
          severity: "success"
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete message",
          severity: "error"
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Server error",
        severity: "error"
      });
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, textIndent: 20 }}>
        <ForwardToInboxIcon sx={{ width: "22px", mr: 1 }} />
        Open Messages
      </Typography>

      <Box sx={{ width: "100%", overflowY: "auto", maxHeight: "60vh" }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2} sx={{ display: "flex", flexDirection: "column" }}>
            {messages.map((msg) => (
              <Grid item xs={12} md={6} lg={4} key={msg.open_mess_id}>
                <Paper
                  elevation={3}
                  sx={{
                    marginRight: 1,
                    p: 2,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {msg.open_mess_id}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "gray" }}>
                    {msg.sender || "Anonymous"}
                  </Typography>

                  <Typography variant="body2">
                    {msg.narrative.length > 60
                      ? msg.narrative.substring(0, 60) + "..."
                      : msg.narrative}
                  </Typography>

                  <Typography variant="caption" sx={{ color: "gray" }}>
                    {msg.created_at}
                  </Typography>

                  <Divider />

                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton onClick={() => setSelected(msg)}>
                      <VisibilityIcon sx={{ width: "24px" }} />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => handleConfirmDelete(msg.open_mess_id)}
                    >
                      <DeleteIcon sx={{ width: "24px" }} />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* VIEW MODAL */}
        <OpenMessageView
          open={!!selected}
          onClose={() => setSelected(null)}
          message={selected}
        />
      </Box>

      {/* ✅ CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OpenMessages;