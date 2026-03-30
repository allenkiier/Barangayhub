import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Container,
  Divider
} from "@mui/material";

// --- Sub-Component: MemberCard ---
const MemberCard = ({ name, role, color = "#1976d2" }) => {
  const isStaff = ["Barangay Secretary", "Barangay Treasurer", "Barangay Clerk"].includes(role);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        minWidth: 220,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 2,
        borderTop: `6px solid ${color}`,
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.05)" },
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {isStaff ? name : `Hon. ${name}`}
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: "italic" }}>
        {role}
      </Typography>
    </Paper>
  );
};

// --- Main Component: OrganizationalChart ---
const OrganizationalChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCouncil = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/council/list");
      setChartData(res.data);
    } catch (err) {
      console.error("Error fetching council chart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouncil();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!chartData) return <Typography>No council data available.</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: "center" }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
        Barangay Joyao Joyao Organizational Structure
      </Typography>
      <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Numancia, Aklan
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        
        {/* ROW 1: Punong Barangay */}
        <Grid container justifyContent="center" direction="row">
          <Grid item xs="auto">
            {chartData.punongBarangay ? (
              <MemberCard 
                name={chartData.punongBarangay.name} 
                role={chartData.punongBarangay.role} 
                color="#d4af37" 
              />
            ) : (
              <Typography color="textSecondary">No Punong Barangay Assigned</Typography>
            )}
          </Grid>
        </Grid>

        <Divider variant="middle" />

        {/* ROW 2: SB Members */}
        <Box>
          <Typography variant="h6" align="center" gutterBottom color="primary" sx={{ mb: 2 }}>
            Sangguniang Barangay Members
          </Typography>
          <Grid container spacing={3} justifyContent="center" direction="row">
            {chartData.sbMembers?.length > 0 ? (
              chartData.sbMembers.map((m) => (
                <Grid item key={m.council_id} xs="auto">
                  <MemberCard name={m.name} role={m.role} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography color="textSecondary">No SB Members found</Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* ROW 3: SK Chairman */}
        <Grid container justifyContent="center" direction="row">
          <Grid item xs="auto">
            {chartData.skChairman && (
              <MemberCard 
                name={chartData.skChairman.name} 
                role={chartData.skChairman.role} 
                color="#9c27b0" 
              />
            )}
          </Grid>
        </Grid>

        <Divider variant="middle" />

        {/* ROW 4: Staff (Secretary, Treasurer, Clerk) */}
        <Box>
          <Grid container spacing={3} justifyContent="center" direction="row">
            {chartData.staff?.length > 0 ? (
              chartData.staff.map((m) => (
                <Grid item key={m.council_id} xs="auto">
                  <MemberCard 
                    name={m.name} 
                    role={m.role} 
                    color="#4caf50"
                  />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography color="textSecondary">No Staff Members found</Typography>
              </Grid>
            )}
          </Grid>
        </Box>

      </Box>
    </Container>
  );
};

export default OrganizationalChart;