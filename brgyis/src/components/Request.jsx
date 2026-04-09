import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
  TextField,
  Box
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import RequestView from "../modals/RequestView";

const Request = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ===================== FILTER =====================
  const filteredRequests = requests.filter((req) => {
    const keyword = searchTerm.toLowerCase();

    return (
      req.user_name?.toLowerCase().includes(keyword) ||
      req.trans_name?.toLowerCase().includes(keyword) ||
      String(req.transaction_id).includes(keyword)
    );
  });

  // ===================== FETCH =====================
  const fetchRequests = () => {
    fetch("http://localhost:5000/api/requests/all")
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching requests:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ===================== PREVIEW =====================
  const handlePreview = (request) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: "78vh", overflowY: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Request List
        </Typography>

        <TextField
          label="Search..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Request Type</b></TableCell>
                <TableCell><b>Transaction ID</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell align="center"><b>Action</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <TableRow key={req.req_id}>
                    <TableCell>{req.user_name || "N/A"}</TableCell>
                    <TableCell>{req.trans_name || "N/A"}</TableCell>
                    <TableCell>{req.transaction_id}</TableCell>
                    <TableCell>
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handlePreview(req)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* ===================== MODAL ===================== */}
      <RequestView
        open={openModal}
        onClose={handleClose}
        request={selectedRequest}
      />
    </Box>
  );
};

export default Request;