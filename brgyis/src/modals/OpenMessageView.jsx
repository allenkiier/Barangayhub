import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button
} from "@mui/material";

const OpenMessageView = ({ open, onClose, message, onDelete }) => {
  if (!message) return null;

  const handleDelete = () => {
    const confirmDelete = window.confirm("Delete this message?");
    if (!confirmDelete) return;

    onDelete(message.open_mess_id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Message Details</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography><strong>ID:</strong> {message.open_mess_id}</Typography>
          <Typography><strong>Sender:</strong> {message.sender || "Anonymous"}</Typography>
          <Typography><strong>Contact:</strong> {message.contact_num || "N/A"}</Typography>
          <Typography><strong>Date:</strong> {message.created_at}</Typography>

          <Typography><strong>Message:</strong></Typography>
          <Typography>{message.narrative}</Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>

            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OpenMessageView;