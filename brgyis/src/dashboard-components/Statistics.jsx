import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid
} from "@mui/material";

import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import OtherHousesIcon from "@mui/icons-material/OtherHouses";
import Man2Icon from "@mui/icons-material/Man2";
import WomanIcon from "@mui/icons-material/Woman";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import WcIcon from "@mui/icons-material/Wc";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import AccessibleIcon from "@mui/icons-material/Accessible";
import ElderlyIcon from "@mui/icons-material/Elderly";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";

import { PieChart } from "@mui/x-charts/PieChart";

import RecordCounts from "./RecordCounts";
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const Statistics = () => {
  const [stats, setStats] = useState({
    population: 0,
    female: 0,
    male: 0,
    married: 0,
    single: 0,
    widowed: 0,
    pwd: 0,
    senior: 0,
    households: 0,
    businesses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const hoverItem = {
    display: "flex",
    alignItems: "center",
    px: 0.4,
    py: 0.7,
    borderRadius: 2,
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f5f5f5",
      boxShadow: 1
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/statistics`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ✅ ADD THIS FUNCTION
  const openModal = async (type, title) => {
    try {
      const res = await fetch(`${API_URL}/api/users/filter?type=${type}`);
      const data = await res.json();

      setModalData(data);
      setModalTitle(title);
      setModalOpen(true);
    } catch (err) {
      console.error("Modal fetch error:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={5} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const genderData = [
    { id: 0, value: stats.male, label: "Male" },
    { id: 1, value: stats.female, label: "Female" },
  ];

  const specialData = [
    { id: 0, value: stats.pwd, label: "PWD" },
    { id: 1, value: stats.senior, label: "Senior" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>

      {/* ================= STATS LIST ================= */}
      <Grid container>
        <Grid item xs={12} sx={{ display: "flex", flexDirection: "column", pl: 2}}>

          <Box sx={{ ...hoverItem }}>
            <AccessibilityNewIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Population: {stats.population}</Typography>
          </Box>

          <Box sx={{ ...hoverItem }}>
            <OtherHousesIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Households: {stats.households}</Typography>
          </Box>

          {/* ✅ MALE CLICK */}
          <Box 
            sx={{ ...hoverItem }} 
            onClick={() => openModal("male", "Male Residents")}
          >
            <Man2Icon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Male Counts: {stats.male}</Typography>
          </Box>

          {/* ✅ FEMALE CLICK */}
          <Box 
            sx={{ ...hoverItem }} 
            onClick={() => openModal("female", "Female Residents")}
          >
            <WomanIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Female Counts: {stats.female}</Typography>
          </Box>

          <Box sx={{ ...hoverItem }}>
            <EmojiPeopleIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Single Counts: {stats.single}</Typography>
          </Box>

          <Box sx={{ ...hoverItem }}>
            <WcIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Married Counts: {stats.married}</Typography>
          </Box>

          <Box sx={{ ...hoverItem }}>
            <GroupRemoveIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Widowed Counts: {stats.widowed}</Typography>
          </Box>

          {/* ✅ PWD CLICK */}
          <Box 
            sx={{ ...hoverItem }} 
            onClick={() => openModal("pwd", "PWD Residents")}
          >
            <AccessibleIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>PWD Counts: {stats.pwd}</Typography>
          </Box>

          {/* ✅ SENIOR CLICK */}
          <Box 
            sx={{ ...hoverItem }} 
            onClick={() => openModal("senior", "Senior Citizens")}
          >
            <ElderlyIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Senior Citizen Counts: {stats.senior}</Typography>
          </Box>

          <Box sx={{ ...hoverItem }}>
            <AddBusinessIcon sx={{ color: "gray", fontSize: 18, mr: 1 }} />
            <Typography>Businesses: {stats.businesses}</Typography>
          </Box>

        </Grid>
      </Grid>

      {/* ================= PIE CHARTS ================= */}
      <Grid container spacing={3} mt={0}>
        <Grid
          sx={{
            pt: 1,
            display: "flex",
            justifyContent: "space-evenly",
            flexDirection: "row",
            width: "100%",
            height: "180px"
          }}
        >
          {/* Gender */}
          <Grid item sx={{ width: "200px" }}>
            <PieChart
              series={[
                {
                  data: genderData,
                  innerRadius: 30,
                  outerRadius: 60,
                  paddingAngle: 3,
                  cornerRadius: 4,
                }
              ]}
              colors={["#060745", "#9e9e9e"]}
              height={130}
              hideLegend
              slotProps={{
                legend: { hidden: true }
              }}
            />
            <Typography textAlign="center" fontWeight={600}>
              Gender Distribution
            </Typography>
          </Grid>

          {/* PWD / Senior */}
          <Grid item sx={{ width: "200px" }}>
            <PieChart
              series={[
                {
                  data: specialData,
                  innerRadius: 30,
                  outerRadius: 60,
                  paddingAngle: 3,
                  cornerRadius: 4,
                }
              ]}
              colors={["#060745", "#9e9e9e"]}
              height={130}
              hideLegend
              slotProps={{
                legend: { hidden: true }
              }}
            />
            <Typography textAlign="center" fontSize={12} fontWeight={600}>
              PWD / Senior Distribution
            </Typography>
          </Grid>

        </Grid>
      </Grid>

      <RecordCounts
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        data={modalData}
      />

    </Box>
  );
};

export default Statistics;