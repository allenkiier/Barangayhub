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
  IconButton
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

const RequestView = ({ open, onClose, request }) => {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [officials, setOfficials] = useState([]);

  // ✅ CONFIRM DELETE STATE
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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

      fetch("http://localhost:3001/api/council/active-officials")
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
        `http://localhost:3001/api/requests/${request.req_id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus(newStatus);
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ OPEN CONFIRM DIALOG
  const handleDeleteClick = () => {
    setConfirmDeleteOpen(true);
  };

  // ✅ CONFIRM DELETE
  const handleConfirmDelete = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3001/api/requests/${request.req_id}`,
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

      alert("Request deleted successfully");

      setConfirmDeleteOpen(false);
      onClose();

    } catch (err) {
      alert("Delete failed: " + err.message);
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
            {/* LEFT */}
            <Grid item xs={12} md={8}>
              <Box sx={{ border: "1px solid #ccc", p: 1, minHeight: "500px" }}>
                {request && TemplateComponent ? (
                  <TemplateComponent request={request} officials={officials} />
                ) : (
                  <Typography>No preview available</Typography>
                )}
              </Box>
            </Grid>

            {/* RIGHT */}
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

                {/* DELETE BUTTON */}
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

      {/* ✅ CONFIRM DELETE DIALOG */}
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
    </>
  );
};

export default RequestView;