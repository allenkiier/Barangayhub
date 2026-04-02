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

const Suggestion = ({ open, onClose }) => {
  const [sender, setSender] = useState("");
  const [contactNum, setContactNum] = useState("");
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!narrative.trim()) {
      alert("Please enter your suggestion.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender,
          contact_num: contactNum,
          narrative
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Suggestion submitted successfully!");

        // reset fields
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
      <DialogTitle>Suggestion / Complaint</DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          You may leave this anonymous. Provide contact details only if you want a response.
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
            label="Your Suggestion / Concern"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Suggestion;