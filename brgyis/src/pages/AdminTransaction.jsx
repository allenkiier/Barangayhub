import React from 'react';
import Request from '../components/Request';

import AdminSideBar from '../components/AdminSideBar';
import { Box } from '@mui/material';

const AdminTransaction = () => {
  
  return (
    <div>
      <Box display="flex">
        <AdminSideBar />
        <Box sx={{ flex: 1, ml: "90px", mt: "20px", paddingRight: 2 }}>
          <div id="header">
            <Box>
              <h4>Barangay Joyao Joyao Information System</h4>
              <h5>Barangay Joyao Joyao, Numancia, Aklan, Philippines</h5>
              <h5>v1.0.0</h5>
            </Box>
          </div>
          <Request />
        </Box>
        
      </Box>
    </div>
  )
}

export default AdminTransaction