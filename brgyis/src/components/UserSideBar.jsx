// import React, { Profiler } from 'react'
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout'
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Divider from '@mui/material/Divider';


const UserSideBar = () => {
  return (
    <div className='sidebar'>
        <img src='bryimg.png' alt='logo' id='logo'/>
        <div className='sidem-inner'>
            <div className='side-op'>
                <Link to="/profile" className="side-item">
                    <AccountCircleIcon/>
                    <span>Profile</span>
                </Link>

                <Link to="/user-dash" className="side-item">
                    <DashboardIcon/>
                    <span>Dashboard</span>
                </Link>

                <Link to="/transaction" className="side-item">
                    <ReceiptIcon/>
                    <span>Transactions</span>
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

export default UserSideBar