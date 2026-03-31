import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Box,
  Button,
  Typography
} from "@mui/material";
import CertificateOfIndigency from "../certificates/CertificateOfIndigency";

const RequestView = ({ open, onClose, request }) => {
  const [status, setStatus] = useState(request?.status || "pending");

  useEffect(() => {
    if (request) {
      setStatus(request.status);
    }
  }, [request]);

  // Example: dynamic renderer based on transaction type
  const renderPreview = () => {
    if (!request) return null;

    switch (request.trans_id) {
      case 1:
        return <CertificateOfIndigency request={request} />;
      default:
        return <Typography>No preview available</Typography>;
    }
  };

  const handleAccept = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/requests/${request.req_id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
    if (response.ok) setStatus("accepted");
  } catch (err) {
    console.error("Update failed:", err);
  }
};

const handleReject = async () => {
  try {
    await fetch(`http://localhost:3001/api/requests/${request.req_id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    setStatus("rejected");
  } catch (err) {
    console.error("Update failed:", err);
  }
};

  const handlePrint = () => {
    window.print(); // or custom print logic
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Request Details</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          
          {/* LEFT COLUMN - PREVIEW */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
                height: "500px",
                overflow: "auto"
              }}
            >
              {renderPreview()}
            </Box>
          </Grid>

          {/* RIGHT COLUMN - ACTIONS */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              <Typography variant="h6">Actions</Typography>

              <Button
                variant="contained"
                color="success"
                onClick={handleAccept}
                disabled={status === "accepted"}
              >
                Accept
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                disabled={status === "rejected"}
              >
                Reject
              </Button>

              {/* PRINT BUTTON */}
              <Button
                variant="outlined"
                onClick={handlePrint}
                disabled={status !== "accepted"}
              >
                Print
              </Button>

              <Typography variant="body2" color="text.secondary">
                Status: {status}
              </Typography>
            </Box>
          </Grid>

        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default RequestView;