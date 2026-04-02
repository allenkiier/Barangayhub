import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Box
} from "@mui/material";

const BusinessClearanceRequest = ({ open, onClose, userId }) => {
  const [tradeName, setTradeName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!tradeName || !businessAddress) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/business-clearance/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userId,
          trade_name: tradeName,
          business_address: businessAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Business Clearance submitted!");
      onClose();

      // reset
      setTradeName("");
      setBusinessAddress("");

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Business Clearance Request</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          
          <TextField
            label="Trade Name"
            value={tradeName}
            onChange={(e) => setTradeName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Business Address"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            Submit Request
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessClearanceRequest;