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

// Templates
import CertificateOfIndigency from "../certificates/CertificateOfIndigency";
import BarangayIDApplication from "../certificates/BarangayIDApplication";
import BarangayClearance from "../certificates/BarangayClearance";
import BusinessClearance from "../certificates/BusinessClearance";
import IncidentReport from "../certificates/IncidentReport";

// ✅ SIMPLE PRINT CONTAINER (NO forwardRef needed)
// const PrintWrapper = ({ children, innerRef }) => {
//   return (
//     <div
//       ref={innerRef}
//       style={{
//         width: "210mm",
//         minHeight: "297mm",
//         backgroundColor: "white",
//         padding: "20px"
//       }}
//     >
//       {children}
//     </div>
//   );
// };

const RequestView = ({ open, onClose, request }) => {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

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

  // ✅ Document Details
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

  // ✅ PRINT (FIXED)
  const handlePrint = useReactToPrint({
  contentRef: contentRef, // Directly pass the ref here
  documentTitle: `${docDetails.name}_${request?.user_name || "Record"}`,
  onAfterPrint: () => console.log("Print success"),
  onPrintError: (error) => console.error("Print failed", error),
});

  // ✅ DOWNLOAD PDF
  const handleDownload = () => {
    if (!contentRef.current) return;

    html2pdf()
      .set({
        margin: 0,
        filename: `${docDetails.name}_${request?.user_name || "Document"}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(contentRef.current)
      .save();
  };

  useEffect(() => {
    if (request) {
      setStatus(request.status);
    }
  }, [request]);

  // ✅ STATUS UPDATE
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ HIDDEN PRINT AREA — MUST ALWAYS EXIST */}
      <div style={{ display: "none" }}>
        <div ref={contentRef} style={{ width: "210mm", padding: "20px", backgroundColor: "white" }}>
            {request && TemplateComponent && <TemplateComponent request={request} />}
        </div>
      </div>

      {/* ✅ UI */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>Document Preview <Typography variant="caption">({docDetails.name})</Typography></Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* PREVIEW PANEL */}
            <Grid item xs={12} md={8}>
              <Box sx={{ border: "1px solid #ccc", p: 2, minHeight: '400px', backgroundColor: '#f5f5f5' }}>
                {request && TemplateComponent ? (
                  <TemplateComponent request={request} />
                ) : (
                  <Typography>No preview available</Typography>
                )}
              </Box>
            </Grid>

            {/* ACTIONS */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button variant="contained" color="success" onClick={() => handleStatusUpdate("accepted")} disabled={loading || status === "accepted"}>Approve</Button>
                <Button variant="contained" color="error" onClick={() => handleStatusUpdate("rejected")} disabled={loading || status === "rejected"}>Reject</Button>
                
                {/* Ensure handlePrint is called directly */}
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
                    onClick={() => handlePrint()} 
                    disabled={status !== "accepted"}
                >
                    Print
                </Button>

                <Typography>Status: <b>{status}</b></Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestView;