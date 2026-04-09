import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, CircularProgress, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const TransactionPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/statistics/transactions");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={1} fullWidth sx={{width: "100%"}}>
      <Button onClick={() => navigate("/transaction-history")} variant="contained" fullWidth sx={{ mb: 2, background: "#060745", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1}}>
        <Typography sx={{ fontWeight: 600, color: "#fff" }}>
            See All Transactions
        </Typography>
        <ArrowForwardIcon sx={{ color: "#fff" }} />
      </Button>

      <Grid container spacing={1} sx={{display: "flex", flexDirection: "column"}}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ px:2, py: 0.7, textAlign: "center", display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
            <Typography>Indigency</Typography>
            <Typography>{data?.indigency || 0}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ px:2, py: 0.7, textAlign: "center", display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
            <Typography>Barangay ID</Typography>
            <Typography>{data?.brgyId || 0}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{px:2, py: 0.7, textAlign: "center", display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
            <Typography>Clearance</Typography>
            <Typography>{data?.clearance || 0}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ px:2, py: 0.7, textAlign: "center", display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
            <Typography>Business Clearance</Typography>
            <Typography>{data?.business || 0}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{px:2, py: 0.7, textAlign: "center", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <Typography>Incident Reports</Typography>
            <Typography>{data?.incident || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionPanel;