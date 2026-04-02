import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse, 
  TextField, 
  Button, 
  Chip, 
  Stack 
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';

const WalkIns = () => {
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState('suggestion');

  const [sender, setSender] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = () => setExpanded(!expanded);

  const handleSubmit = async () => {
    if (!narrative.trim()) {
      alert("Please enter your message.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        type === "complaint"
          ? "http://localhost:3001/api/complaints"
          : "http://localhost:3001/api/suggestions";

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

      if (res.ok) {
        alert(`${type} submitted successfully!`);

        // reset form
        setSender('');
        setContactNum('');
        setNarrative('');
        setType('suggestion');
        setExpanded(false);
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }

    setLoading(false);
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
      {/* Trigger Row */}
      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="center" 
        sx={{ mb: 2, position: 'relative', zIndex: 2 }}
      >
        <IconButton 
          onClick={handleToggle}
          sx={{ 
            backgroundColor: '#060745', 
            color: 'white',
            transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': { backgroundColor: '#0a0c6e' },
            boxShadow: 3
          }}
        >
          <CreateIcon />
        </IconButton>
        
        <Typography 
          variant="h6"
          onClick={handleToggle}
          sx={{ 
            color: '#060745',
            cursor: 'pointer',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          {expanded ? "Tell us about it!" : "Do you have any suggestions or complaints?"}
        </Typography>
      </Stack>

      {/* Expandable Form */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1, background: 'transparent' }}>
          <Stack spacing={2.5}>

            <TextField 
              label="Full Name" 
              variant="standard" 
              fullWidth 
              sx={inputStyle} 
              value={sender}
              onChange={(e) => setSender(e.target.value)}
            />

            <TextField 
              label="Contact Number" 
              variant="standard" 
              fullWidth 
              sx={inputStyle} 
              value={contactNum}
              onChange={(e) => setContactNum(e.target.value)}
            />
            
            <Box>
              <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 'bold', color: '#060745' }}>
                TYPE OF FEEDBACK
              </Typography>

              <Stack direction="row" spacing={1}>
                <Chip 
                  label="Suggestion" 
                  variant={type === 'suggestion' ? "filled" : "outlined"}
                  onClick={() => setType('suggestion')}
                  sx={{
                    borderColor: '#060745',
                    color: type === 'suggestion' ? 'white' : '#060745',
                    backgroundColor: type === 'suggestion' ? '#060745' : 'transparent',
                    '&:hover': { backgroundColor: type === 'suggestion' ? '#0a0c6e' : 'rgba(6, 7, 69, 0.05)' }
                  }}
                />

                <Chip 
                  label="Complaint" 
                  variant={type === 'complaint' ? "filled" : "outlined"}
                  onClick={() => setType('complaint')}
                  sx={{
                    borderColor: '#d32f2f',
                    color: type === 'complaint' ? 'white' : '#d32f2f',
                    backgroundColor: type === 'complaint' ? '#d32f2f' : 'transparent',
                    '&:hover': { backgroundColor: type === 'complaint' ? '#b71c1c' : 'rgba(211, 47, 47, 0.05)' }
                  }}
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
            />

            <Button 
              variant="contained" 
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              sx={{ 
                mt: 2,
                py: 1.2,
                borderRadius: '8px',
                backgroundColor: '#060745', 
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#0a0c6e' } 
              }}
            >
              {loading ? "Submitting..." : "Submit Form"}
            </Button>

          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default WalkIns;