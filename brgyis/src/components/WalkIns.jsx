import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse, 
  TextField, 
  Button, 
  Chip, 
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';

const WalkIns = () => {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState('suggestion');

  const [sender, setSender] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleToggle = () => setExpanded(!expanded);

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!sender.trim() || !contactNum.trim() || !narrative.trim()) {
      setSnackbar({
        open: true,
        message: "All fields are required",
        severity: "error"
      });
      return false;
    }
    return true;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint =
        type === "complaint"
          ? "/api/complaints"
          : "/api/suggestions";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender,
          contact_num: contactNum,
          narrative
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      // SUCCESS
      setSnackbar({
        open: true,
        message: `${type} submitted successfully!`,
        severity: "success"
      });

      // reset form
      setSender('');
      setContactNum('');
      setNarrative('');
      setType('suggestion');
      setExpanded(false);

    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.message || "Server error",
        severity: "error"
      });
    }

    setLoading(false);
    setConfirmOpen(false);
  };

  const inputStyle = {
    "& .MuiInputLabel-root": { color: "rgba(6, 7, 69, 0.7)" },
    "& .MuiInputBase-input": { color: "#060745" },
    "& .MuiInput-underline:before": { borderBottomColor: "rgba(6, 7, 69, 0.3)" },
    "& .MuiInput-underline:hover:before": { borderBottomColor: "#060745 !important" },
    "& .MuiInput-underline:after": { borderBottomColor: "#060745" },
    mb: 1
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 450 }}>
      
      {/* TRIGGER */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <IconButton 
          onClick={handleToggle}
          sx={{ 
            backgroundColor: '#060745', 
            color: 'white',
            transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
            '&:hover': { backgroundColor: '#0a0c6e' },
            boxShadow: 3
          }}
        >
          <CreateIcon />
        </IconButton>

        <Typography 
          variant="h6"
          onClick={handleToggle}
          sx={{ color: '#060745', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {expanded ? "Tell us about it!" : "Do you have any suggestions or complaints?"}
        </Typography>
      </Stack>

      {/* FORM */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1 }}>
          <Stack spacing={2.5}>

            <TextField 
              label="Full Name" 
              variant="standard" 
              fullWidth 
              sx={inputStyle} 
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              required
            />

            <TextField 
              label="Contact Number" 
              variant="standard" 
              fullWidth 
              sx={inputStyle} 
              value={contactNum}
              onChange={(e) => setContactNum(e.target.value)}
              required
            />
            
            <Box>
              <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold', color: '#060745' }}>
                TYPE OF FEEDBACK
              </Typography>

              <Stack direction="row" spacing={1}>
                <Chip 
                  label="Suggestion" 
                  variant={type === 'suggestion' ? "filled" : "outlined"}
                  onClick={() => setType('suggestion')}
                />

                <Chip 
                  label="Complaint" 
                  variant={type === 'complaint' ? "filled" : "outlined"}
                  onClick={() => setType('complaint')}
                />
              </Stack>
            </Box>

            <TextField
              label="Your Narrative"
              multiline
              rows={3}
              variant="standard"
              fullWidth
              sx={inputStyle}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              required
            />

            <Button 
              variant="contained" 
              fullWidth
              onClick={() => {
                if (validateForm()) setConfirmOpen(true);
              }}
              disabled={loading}
              sx={{ 
                mt: 2,
                py: 1.2,
                borderRadius: '8px',
                backgroundColor: '#060745'
              }}
            >
              Submit Form
            </Button>

          </Stack>
        </Box>
      </Collapse>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit this {type}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default WalkIns;