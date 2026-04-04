import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Grid } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

const Residentials = () => {
  const [data, setData] = useState([]);
  const [years, setYears] = useState([]);
  const [mostYear, setMostYear] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResidentials = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/statistics/residentials");
        const result = await res.json();

        const trend = result.trend || [];
        const most = result.mostYear || null;
        const demo = result.demographics || null;

        setData(trend.map(item => item.count));
        setYears(trend.map(item => item.year));
        setMostYear(most);
        setDemographics(demo);

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResidentials();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={1} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

      {/* Sparkline Section */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Typography variant="h6" sx={{fontWeight: 600}}>
          Resident Counts Over Time
        </Typography>

        <SparkLineChart
          data={data}
          height={100}
          showTooltip
          showHighlight
          color={["#060745"]}
          sx={{
            backgroundColor: "transparent",
          }}
        />

        <Box mt={2} display="flex" justifyContent="space-between">
          {years.map((year, index) => (
            <Typography key={index} variant="caption">
              {year}
            </Typography>
          ))}
        </Box>
      </Paper>

      {/* Most Year Card */}
      <Paper
        elevation={2}
        sx={{
          p: 1.4,
          backgroundColor: "#060745",
        }}
      >
        <Typography variant="subtitle2" sx={{color: "#ecefe3"}}>
          Most Year of Residency:
        </Typography>

        <Typography variant="h6" fontWeight="bold" sx={{color: "#ecefe3"}}>
          {mostYear?.year || "N/A"}
        </Typography>

        <Typography variant="body2" sx={{color: "#ecefe3"}}>
          Total Residents: {mostYear?.count || 0}
        </Typography>
      </Paper>

      {/* Demographics Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Typography variant="h6" mb={1} sx={{fontWeight: 600}}>
          Population Breakdown
        </Typography>

        <Grid container spacing={2} sx={{display: "flex", flexDirection: "column"}}>
          <Grid item xs={6}>
            <Paper
              sx={{
                py: 1,
                px: 2,
                textAlign: "center",
                backgroundColor: "transparent",
                display: "flex",
                flexDirection: "row",
                justifyContent : "space-between",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1">Below Legal Age</Typography>
              <Typography variant="h5">
                {demographics?.minors || 0}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper
             sx={{
                py: 1,
                px: 2,
                textAlign: "center",
                backgroundColor: "transparent",
                display: "flex",
                flexDirection: "row",
                justifyContent : "space-between",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1">Adults</Typography>
              <Typography variant="h5">
                {demographics?.adults || 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

    </Box>
  );
};

export default Residentials;