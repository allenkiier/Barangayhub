import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography
} from "@mui/material";

const Complaints = ({ open, onClose }) => {
  const [sender, setSender] = useState("");
  const [contactNum, setContactNum] = useState("");
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!narrative.trim()) {
      alert("Please enter your complaint.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: sender || null,
          contact_num: contactNum || null,
          narrative
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Complaint submitted! ID: ${data.id}`);

        setSender("");
        setContactNum("");
        setNarrative("");

        onClose();
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Complaint Form</DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          You may file anonymously. Provide contact details if you want follow-up.
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Name (Optional)"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            fullWidth
          />

          <TextField
            label="Contact Number (Optional)"
            value={contactNum}
            onChange={(e) => setContactNum(e.target.value)}
            fullWidth
          />

          <TextField
            label="Complaint Details"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
          />

          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Complaints;