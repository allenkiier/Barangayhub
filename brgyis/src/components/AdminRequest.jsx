import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

const AdminRequest = () => {
  const [requests, setRequests] = useState([]);

  // ================= FETCH REQUESTS =================
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/admin/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      const data = text ? JSON.parse(text) : [];
      setRequests(data);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };

  // ================= LOAD ONCE =================
  useEffect(() => {
    fetchRequests();
  }, []); // ✅ FIXED (no infinite loop)

  // ================= APPROVE =================
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3001/api/admin/approve/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      await fetchRequests(); // refresh list
    } catch (err) {
      console.error("Approve error:", err.message);
    }
  };

  // ================= REJECT =================
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3001/api/admin/reject/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text);
      }

      await fetchRequests(); // refresh list
    } catch (err) {
      console.error("Reject error:", err.message);
    }
  };

  // ================= UI =================
  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Admission Requests
        </Typography>

        <Stack spacing={2}>
          {requests.length === 0 ? (
            <Typography>No pending requests</Typography>
          ) : (
            requests.map((req) => (
              <Paper
                key={req.userid}
                elevation={3}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* LEFT SIDE */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>

                  <Box>
                    <Typography fontWeight="bold">
                      {req.user_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {req.email_ad}
                    </Typography>
                  </Box>
                </Box>

                {/* RIGHT SIDE */}
                <Box>
                  <IconButton
                    color="success"
                    onClick={() => handleApprove(req.userid)}
                  >
                    <CheckIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleReject(req.userid)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default AdminRequest;