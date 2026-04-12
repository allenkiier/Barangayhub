import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Box,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  DialogActions
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";

// Templates
import CertificateOfIndigency from "../certificates/CertificateOfIndigency";
import BarangayIDApplication from "../certificates/BarangayIDApplication";
import BarangayClearance from "../certificates/BarangayClearance";
import BusinessClearance from "../certificates/BusinessClearance";
import IncidentReport from "../certificates/IncidentReport";

const UserRequestView = ({ open, onClose, request, onRequestUpdated }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [officials, setOfficials] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const contentRef = useRef(null);

  // ================= TEMPLATE MAP =================
  const templateMap = {
    1: CertificateOfIndigency,
    2: BarangayIDApplication,
    3: BarangayClearance,
    4: BusinessClearance,
    5: IncidentReport,
  };

  const TemplateComponent = request
    ? templateMap[Number(request.trans_id)]
    : null;

  // ================= FETCH =================
  useEffect(() => {
    if (open && request) {
      setStatus(request.status);

      fetch(`${API_URL}/api/council/active-officials`)
        .then((res) => res.json())
        .then((data) => setOfficials(data))
        .catch((err) => {
          console.error(err);
          setSnackbar({
            open: true,
            message: "Failed to load officials",
            severity: "error"
          });
        });
    }
  }, [open, request]);

  // ================= CANCEL REQUEST =================
  const handleCancel = async () => {
    if (!request) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/requests/${request.req_id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("cancelled");

      if (onRequestUpdated) {
        onRequestUpdated({ ...request, status: "cancelled" });
      }

      setSnackbar({
        open: true,
        message: "Request cancelled successfully",
        severity: "success"
      });

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "Cancel failed",
        severity: "error"
      });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      {/* HIDDEN PRINT CONTENT */}
      <div style={{ display: "none" }}>
        <div ref={contentRef} style={{ width: "210mm", backgroundColor: "white" }}>
          {request && TemplateComponent && (
            <TemplateComponent request={request} officials={officials} />
          )}
        </div>
      </div>

      {/* MAIN DIALOG */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Request Preview</Typography>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>

            {/* LEFT: PREVIEW */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  border: "1px solid #ccc",
                  p: 2,
                  minHeight: "500px",
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  justifyContent: "center",
                  overflowY: "auto",
                  maxHeight: "70vh"
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "white",
                    boxShadow: 3,
                    transform: "scale(0.95)",
                    transformOrigin: "top center"
                  }}
                >
                  {request && TemplateComponent ? (
                    <TemplateComponent request={request} officials={officials} />
                  ) : (
                    <Box sx={{ p: 4 }}>
                      <Typography color="text.secondary">
                        No preview available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* RIGHT: ACTIONS */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                <Typography variant="subtitle2" color="text.secondary">
                  Request Actions
                </Typography>

                <Box>
                  <Typography variant="body2">
                    Status:{" "}
                    <b style={{ textTransform: "uppercase" }}>
                      {status}
                    </b>
                  </Typography>
                </Box>

                {/* CANCEL BUTTON */}
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setConfirmOpen(true)}
                  disabled={loading || status !== "pending"}
                  fullWidth
                >
                  {status === "pending" ? "Cancel Request" : "Cannot Cancel"}
                </Button>

                {status !== "pending" && (
                  <Typography variant="caption" color="text.secondary">
                    Only pending requests can be cancelled.
                  </Typography>
                )}

              </Box>
            </Grid>

          </Grid>
        </DialogContent>
      </Dialog>

      {/* ✅ CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this request?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            No
          </Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            color="error"
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserRequestView;