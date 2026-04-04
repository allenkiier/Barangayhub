import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  CircularProgress
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import OpenMessageView from "../modals/OpenMessageView";

const OpenMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // FETCH
  const fetchMessages = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/open-messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // DELETE (Reusable)
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/open-messages/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.open_mess_id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
     <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, textIndent: 20}}>
        <ForwardToInboxIcon sx={{ width: "22px", mr: 1 }} />
        Open Messages
      </Typography>
    <Box sx={{ p: "0 2 0 0", width: "100%", overflowY: "auto", maxHeight: "60vh" }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} sx={{display: "flex", flexDirection: "column" }}>
          {messages.map((msg) => (
            <Grid item xs={12} md={6} lg={4} key={msg.open_mess_id}>
              <Paper
                elevation={3}
                sx={{
                  marginRight:2,
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {msg.open_mess_id}
                </Typography>

                <Typography variant="body2" sx={{ color: "gray" }}>
                  {msg.sender || "Anonymous"}
                </Typography>

                <Typography variant="body2">
                  {msg.narrative.length > 60
                    ? msg.narrative.substring(0, 60) + "..."
                    : msg.narrative}
                </Typography>

                <Typography variant="caption" sx={{ color: "gray" }}>
                  {msg.created_at}
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={() => setSelected(msg)}>
                    <VisibilityIcon sx={{width: "14px"}}/>
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(msg.open_mess_id)}
                  >
                    <DeleteIcon sx={{width: "14px"}} />
                  </IconButton >
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 🔥 External Modal */}
      <OpenMessageView
        open={!!selected}
        onClose={() => setSelected(null)}
        message={selected}
        onDelete={handleDelete}
      />
    </Box>
    </>
  );
};

export default OpenMessages;