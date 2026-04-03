import React from 'react'
import AdminRequest from '../components/AdminRequest'
import AdminSideBar from '../components/AdminSideBar'
import { Box } from '@mui/material'

const Admission = () => {
  return (
    <div>
      <AdminSideBar/>
        <Box sx={{ flex: 1, ml: "90px", mt: "20px", paddingRight: 2 }}>
          <div id="header">
            <Box>
              <h4>Barangay Joyao Joyao Information System</h4>
              <h5>Barangay Joyao Joyao, Numancia, Aklan, Philippines</h5>
              <h5>v1.0.0</h5>
            </Box>
          </div>
          <AdminRequest />
        </Box>
    </div>
  )
}

export default Admission