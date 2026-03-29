import React from 'react'
import { Link } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const ProfileBadge = () => {
  return (
    <div>
        <Link to="/profile" style={{ color: "black" }}>
            <AccountCircleIcon sx={{fontSize: 35}}/>
        </Link>
    </div>
  )
}

export default ProfileBadge