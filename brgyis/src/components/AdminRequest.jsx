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

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/admin/requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    await fetch(`http://localhost:3001/api/admin/approve/${id}`, {
      method: "POST",
    });
    fetchRequests();
  };

  const handleReject = async (id) => {
    await fetch(`http://localhost:3001/api/admin/reject/${id}`, {
      method: "POST",
    });
    fetchRequests();
  };

  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Admission Requests
        </Typography>

        <Stack spacing={2}>
          {requests.map((req) => (
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
              {/* Left: Avatar + Info */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar>
                  <PersonIcon />
                </Avatar>

                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {req.user_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {req.email_ad}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Actions */}
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
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

export default AdminRequest;