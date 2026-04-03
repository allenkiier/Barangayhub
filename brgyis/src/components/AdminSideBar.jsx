import React, { useState } from 'react'; // Added useState
import { useNavigate, Link } from 'react-router-dom';
import { 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button 
} from '@mui/material'; // Added MUI Dialog components
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Groups2Icon from '@mui/icons-material/Groups2';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; 
import AttributionIcon from '@mui/icons-material/Attribution';

const AdminSideBar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // Controls the Dialog

  // Open Dialog
  const handleOpen = () => setOpen(true);

  // Close Dialog without action
  const handleClose = () => setOpen(false);

  // Finalize Logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setOpen(false);
    navigate("/", { replace: true });
  };

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

                <Link to="/adminAdmit" className="side-item">
                    <AdminPanelSettingsIcon/>
                    <span>Admin Admission</span>
                </Link>

                <Link to="/userRecords" className="side-item">
                    <AttributionIcon/>
                    <span>User Records</span>
                </Link>
            </div>

            <div className="lo">
                <Divider />
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

        {/* --- MUI ADMIN CONFIRMATION DIALOG --- */}
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="admin-logout-title"
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px',
              minWidth: '300px'
            }
          }}
        >
          <DialogTitle id="admin-logout-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
            <WarningAmberIcon color="warning" /> Confirm Admin Logout
          </DialogTitle>
          
          <DialogContent>
            <DialogContentText>
              You are about to log out of the <strong>Admin Portal</strong>. Any unsaved administrative changes may be lost.
            </DialogContentText>
          </DialogContent>

          <DialogActions sx={{ padding: '16px' }}>
            <Button 
              onClick={handleClose} 
              sx={{ color: 'text.secondary', fontWeight: 'bold' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="contained" 
              color="error"
              sx={{ 
                borderRadius: '8px',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#d32f2f', boxShadow: 'none' }
              }}
            >
              Log Out
            </Button>
          </DialogActions>
        </Dialog>
    </div>
  )
}

export default AdminSideBar;