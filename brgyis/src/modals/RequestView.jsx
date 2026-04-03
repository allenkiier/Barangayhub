import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  const contentRef = useRef(null);

  // ✅ Template Mapping
  const templateMap = {
    1: CertificateOfIndigency,
    2: BarangayIDApplication,
    3: BarangayClearance,
    4: BusinessClearance,
    5: IncidentReport,
  };

  const TemplateComponent = request ? templateMap[request.trans_id] : null;

  // ✅ Fetch Active Officials and Sync Status
  useEffect(() => {
    if (open) {
      // 1. Sync local status with the incoming request status
      if (request) {
        setStatus(request.status);
      }

      // 2. Fetch the active council members for the signatures
      fetch('http://localhost:3001/api/council/active-officials')
        .then((res) => res.json())
        .then((data) => {
          setOfficials(data);
        })
        .catch((err) => {
          console.error("Error fetching officials:", err);
        });
    }
  }, [open, request]);

  // ✅ Document Details for Filename and UI
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

  // ✅ PRINT LOGIC
  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `${docDetails.name}_${request?.user_name || "Record"}`,
    onAfterPrint: () => console.log("Print success"),
    onPrintError: (error) => console.error("Print failed", error),
  });

  // ✅ DOWNLOAD PDF LOGIC
  const handleDownload = () => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const opt = {
      margin: 0,
      filename: `${docDetails.name}_${request?.user_name || "Document"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };

  // ✅ STATUS UPDATE (Approve/Reject)
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
      // Using a snackbar here would be better, but keeping alert for now as per your original
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this request?")) return;

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

    // ✅ Safely read response as text first
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!res.ok) throw new Error(data.message || data.error || text);

    alert("Request deleted successfully");

    onClose();
    window.location.reload();

  } catch (err) {
    alert("Delete failed: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {/* ✅ HIDDEN PRINT AREA — This is what the PDF/Printer "sees" */}
      <div style={{ display: "none" }}>
        <div ref={contentRef} style={{ width: "210mm", backgroundColor: "white" }}>
          {request && TemplateComponent && (
            <TemplateComponent request={request} officials={officials} />
          )}
        </div>
      </div>

      {/* ✅ MAIN UI DIALOG */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
          <Box>
            Document Preview 
            <Typography variant="caption" sx={{ ml: 1, color: docDetails.color, fontWeight: 'bold' }}>
              ({docDetails.name.replace(/_/g, ' ')})
            </Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* LEFT PANEL: The actual document preview */}
            <Grid item xs={12} md={8}>
              <Box 
                sx={{ 
                  border: "1px solid #ccc", 
                  p: 1, 
                  minHeight: '500px', 
                  backgroundColor: '#525659', // Dark grey background like a PDF viewer
                  display: 'flex',
                  justifyContent: 'center',
                  overflowY: 'auto',
                  maxHeight: '70vh'
                }}
              >
                <Box sx={{ transform: 'scale(0.9)', transformOrigin: 'top center', backgroundColor: 'white', boxShadow: 3 }}>
                  {request && TemplateComponent ? (
                    <TemplateComponent request={request} officials={officials} />
                  ) : (
                    <Box sx={{ p: 5, backgroundColor: 'white' }}>
                       <Typography color="textSecondary">No preview available for this request type.</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* RIGHT PANEL: Administrative Actions */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">Administrative Actions</Typography>
                
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleStatusUpdate("accepted")} 
                  disabled={loading || status === "accepted"}
                  fullWidth
                >
                  Approve Request
                </Button>

                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => handleStatusUpdate("rejected")} 
                  disabled={loading || status === "rejected"}
                  fullWidth
                >
                  Reject Request
                </Button>

                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={loading}
                  fullWidth
                >
                  Delete Request
                </Button>

                <Typography variant="subtitle2" color="textSecondary">Export Options</Typography>
                
                <Button 
                  variant="contained" 
                  startIcon={<DownloadIcon />} 
                  onClick={handleDownload} 
                  disabled={status !== "accepted"}
                  sx={{ backgroundColor: '#060745', '&:hover': { backgroundColor: '#0a0b63' } }}
                >
                  Download PDF
                </Button>

                <Button 
                  variant="outlined" 
                  startIcon={<PrintIcon />} 
                  onClick={() => handlePrint()} 
                  disabled={status !== "accepted"}
                >
                  Print Document
                </Button>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2">
                    Current Status: <b style={{ textTransform: 'uppercase', color: status === 'accepted' ? 'green' : 'orange' }}>{status}</b>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestView;