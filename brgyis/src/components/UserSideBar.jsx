import React from 'react'
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';


const UserSideBar = () => {
  return (
    <div className='sidem'>
        <img src='bry.png' alt='logo' id='logo'/>
        <div className='sidem-inner'>
            <div className='side-op'>
                <Link to="/user-dash" className="sideitem">
                    <DashboardIcon  sx={{color:"#eee6e3"}}/>
                    <span>User Dashboard</span>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default UserSideBar