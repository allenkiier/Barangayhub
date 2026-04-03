import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent,
  TextField, Button, Box,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";

const BusinessClearanceRequest = ({ open, onClose, userid }) => {
  const [tradeName, setTradeName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [appType, setAppType] = useState(""); // ✅ added
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!userid) {
    alert("User ID is required");
    return;
  }

  if (!tradeName || !businessAddress || !appType) {
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
        userid: userid,
        trade_name: tradeName,
        business_address: businessAddress,
        app_type: appType
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    alert("Business Clearance submitted!");
    onClose();

    setTradeName("");
    setBusinessAddress("");
    setAppType("");

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
          <FormControl fullWidth>
            <InputLabel id="app-type-label">Application Type</InputLabel>
            <Select
              labelId="app-type-label"
              value={appType}
              label="Application Type"
              onChange={(e) => setAppType(e.target.value)}
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="renewal">Renewal</MenuItem>
              <MenuItem value="amendment">Amendment</MenuItem>
            </Select>
          </FormControl>
          
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

          {/* ✅ APPLICATION TYPE SELECT */}
          

          <Button
            variant="contained"
             sx={{background: "#060745"}}
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