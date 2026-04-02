import React from 'react';
import { Badge, IconButton, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

const ProfileBadge = ({ isComplete }) => {
  const navigate = useNavigate();

  return (
    <IconButton onClick={() => navigate('/profile')}>
      <Badge 
        color="error" 
        variant="dot" 
        invisible={isComplete}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Avatar sx={{ bgcolor: '#060745' }}>
          <AccountCircleIcon />
        </Avatar>
      </Badge>
    </IconButton>
  );
};

export default ProfileBadge;