import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";

// Templates
import CertificateOfIndigency from "../certificates/CertificateOfIndigency";
import BarangayIDApplication from "../certificates/BarangayIDApplication";
import BarangayClearance from "../certificates/BarangayClearance";
import BusinessClearance from "../certificates/BusinessClearance";
import IncidentReport from "../certificates/IncidentReport";

// ✅ Added onUpdate to props
const RequestView = ({ open, onClose, request, onUpdate }) => {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [officials, setOfficials] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const contentRef = useRef(null);

  const templateMap = {
    1: CertificateOfIndigency,
    2: BarangayIDApplication,
    3: BarangayClearance,
    4: BusinessClearance,
    5: IncidentReport,
  };

  const TemplateComponent = request ? templateMap[request.trans_id] : null;

  useEffect(() => {
    if (open) {
      if (request) {
        setStatus(request.status);
      }

      fetch(`${API_URL}/api/council/active-officials`)
        .then((res) => res.json())
        .then((data) => setOfficials(data))
        .catch((err) => console.error(err));
    }
  }, [open, request]);

  const getDocDetails = () => {
    switch (request?.trans_id) {
      case 1: return { name: "Certificate_of_Indigency", color: "#1976d2" };
      case 2: return { name: "Barangay_ID_Application", color: "#9c27b0" };
      case 3: return { name: "Barangay_Clearance", color: "#2e7d32" };
      case 4: return { name: "Business_Clearance", color: "#7d5b2e" };
      case 5: return { name: "Incident_Report", color: "#9c2456" };
      default: return { name: "Document", color: "#757575" };
    }
  };

  const docDetails = getDocDetails();

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `${docDetails.name}_${request?.user_name || "Record"}`
  });

  const handleDownload = () => {
    if (!contentRef.current) return;

    const opt = {
      margin: 0,
      filename: `${docDetails.name}_${request?.user_name || "Document"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(contentRef.current).save();
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/requests/${request.req_id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus(newStatus);

      setSnackbar({
        open: true,
        message: `Status updated to ${newStatus}`,
        severity: "success",
      });

      // ✅ Trigger refresh in the background list
      if (onUpdate) onUpdate();

    } catch (err) {
      setSnackbar({
        open: true,
        message: "Update failed: " + err.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/requests/${request.req_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) throw new Error(data.message || data.error || text);

      setSnackbar({
        open: true,
        message: "Request deleted successfully",
        severity: "success",
      });

      setConfirmDeleteOpen(false);

      // ✅ Trigger refresh so the item disappears from the background list
      if (onUpdate) onUpdate();

      // Small delay so user sees snackbar before modal closes
      setTimeout(() => {
        onClose();
      }, 800);

    } catch (err) {
      setSnackbar({
        open: true,
        message: "Delete failed: " + err.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HIDDEN PRINT AREA */}
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
          <Box>
            Document Preview
            <Typography variant="caption" sx={{ ml: 1, color: docDetails.color }}>
              ({docDetails.name.replace(/_/g, " ")})
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* LEFT - Preview */}
            <Grid item xs={12} md={8}>
              <Box sx={{ border: "1px solid #ccc", p: 1, minHeight: "500px" }}>
                {request && TemplateComponent ? (
                  <TemplateComponent request={request} officials={officials} />
                ) : (
                  <Typography>No preview available</Typography>
                )}
              </Box>
            </Grid>

            {/* RIGHT - Actions */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleStatusUpdate("accepted")}
                  disabled={loading || status === "accepted"}
                  fullWidth
                >
                  Approve
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={loading || status === "rejected"}
                  fullWidth
                >
                  Reject
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteClick}
                  disabled={loading}
                  fullWidth
                >
                  Delete
                </Button>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  disabled={status !== "accepted"}
                >
                  Download PDF
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  disabled={status !== "accepted"}
                >
                  Print
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RequestView;