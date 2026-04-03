import React, { useEffect, useState } from 'react';
import UserSideBar from '../components/UserSideBar';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import UserRequestView from '../modals/UserRequestView';

const UserRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openView, setOpenView] = useState(false);

  const userid = localStorage.getItem("userid");

  // ✅ Open modal
  const handleView = (req) => {
    setSelectedRequest(req);
    setOpenView(true);
  };

  // ✅ Close modal
  const handleCloseView = () => {
    setOpenView(false);
    setSelectedRequest(null);
  };

  // ✅ Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/requests/user/${userid}`);
        const data = await res.json();

        if (res.ok) {
          setRequests(data);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    if (userid) fetchRequests();
  }, [userid]);

  // ✅ Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "cancelled":
        return "default";
      default:
        return "warning";
    }
  };

  return (
    <Box display="flex">
      <UserSideBar />

      <Box sx={{ flex: 1, p: 3, marginLeft: "100px" }} className="request-cont">
        <Typography variant="h4" fontWeight="bold" mb={2} color='#060745'>
          My Requests
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 2,
            maxHeight: "70vh",
            overflowY: "auto",
            borderRadius: 2
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress />
            </Box>
          ) : requests.length === 0 ? (
            <Typography>No requests found.</Typography>
          ) : (
            <Stack spacing={2}>
              {requests.map((req) => (
                <Box
                  key={req.req_id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  {/* LEFT SIDE */}
                  <Box>
                    <Typography fontWeight="bold">
                      {req.trans_name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Transaction ID: {req.transaction_id}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {new Date(req.created_at).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* RIGHT SIDE */}
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={req.status}
                      color={getStatusColor(req.status)}
                      sx={{ textTransform: "capitalize", fontWeight: "bold" }}
                    />

                    <IconButton onClick={() => handleView(req)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        {/* ✅ MODAL (MUST BE OUTSIDE CONDITIONAL) */}
        <UserRequestView
          open={openView}
          onClose={handleCloseView}
          request={selectedRequest}
          onRequestUpdated={(updated) => {
            setRequests((prev) =>
              prev.map((r) =>
                r.req_id === updated.req_id
                  ? { ...r, status: updated.status }
                  : r
              )
            );
          }}
        />
      </Box>
    </Box>
  );
};

export default UserRequest;