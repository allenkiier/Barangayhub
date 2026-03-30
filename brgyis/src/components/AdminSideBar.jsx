// import React, { Profiler } from 'react'
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout'
import ReceiptIcon from '@mui/icons-material/Receipt';
import Divider from '@mui/material/Divider';
import Groups2Icon from '@mui/icons-material/Groups2';


const AdminSideBar = () => {
  return (
    <div className='sidebar'>
        <img src='bryimg.png' alt='logo' id='logo'/>
        <div className='sidem-inner'>
            <div className='side-op'>

                <Link to="/admin-dash" className="side-item">
                    <DashboardIcon/>
                    <span>Dashboard</span>
                </Link>

                <Link to="/transaction-history" className="side-item">
                    <ReceiptIcon/>
                    <span>Transaction History</span>
                </Link>

                <Link to="/council" className="side-item">
                    <Groups2Icon/>
                    <span>Council</span>
                </Link>
                  
            </div>

        
            <div className="lo">
                <Divider />
                <Link to="/" className="side-item">
                    <LogoutIcon />
                    <span>Log Out</span>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default AdminSideBar