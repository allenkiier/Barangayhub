import { useState } from 'react'; // Added useState
import { useNavigate, Link } from 'react-router-dom';
import {
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'; // Added MUI components
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Groups2Icon from '@mui/icons-material/Groups2';

const UserSideBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // State to control Dialog visibility

  // Opens the MUI Dialog
  const handleOpen = () => setOpen(true);

  // Closes the MUI Dialog without logging out
  const handleClose = () => setOpen(false);

  // The actual logout logic
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setOpen(false); // Close dialog
    navigate("/", { replace: true });
  };

  return (
    <div className='sidebar'>
      <img src='bryimg.png' alt='logo' id='logo' />
      <div className='sidem-inner'>
        <div className='side-op'>
          <Link to="/profile" className="side-item">
            <AccountCircleIcon />
            <span>Profile</span>
          </Link>

          <Link to="/user-dash" className="side-item">
            <DashboardIcon />
            <span>Dashboard</span>
          </Link>

          <Link to="/request" className="side-item">
            <ReceiptIcon />
            <span>Transactions</span>
          </Link>

          <Link to="/councilprev" className="side-item">
            <Groups2Icon />
            <span>Council</span>
          </Link>
        </div>

        <div className="lo">
          <Divider />
          {/* Triggers the Dialog instead of the browser confirm */}
          <div
            className="side-item"
            onClick={handleOpen}
            style={{ cursor: 'pointer' }}
          >
            <LogoutIcon />
            <span>Log Out</span>
          </div>
        </div>
      </div>

      {/* --- MUI CONFIRMATION DIALOG --- */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '15px',
            padding: '10px',
            backgroundColor: '#fff'
          }
        }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ fontWeight: 'bold' }}>
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to end your session? You will need to log in again to access the portal.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button 
            onClick={handleClose} 
            sx={{ color: '#666', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="contained" 
            autoFocus 
            sx={{ 
              backgroundColor: '#d32f2f', // Red for logout
              '&:hover': { backgroundColor: '#b71c1c' },
              textTransform: 'none',
              borderRadius: '20px'
            }}
          >
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserSideBar;