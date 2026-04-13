import React, { useEffect, useState, useCallback } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserRecords = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ DELETE CONFIRM STATE
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    civil_status: '',
    sex: '',
    contact_no: ''
  });

  // ✅ SNACKBAR HELPER
  const showSnack = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  // ✅ FETCH USERS
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users from server');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showSnack(err.message, 'error');
    }
  }, [showSnack]);

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ SEARCH FILTER LOGIC
  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const userId = String(user.id || user.userid || '');
    return (
      user.name?.toLowerCase().includes(keyword) ||
      user.user_name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.email_ad?.toLowerCase().includes(keyword) ||
      user.sex?.toLowerCase().includes(keyword) ||
      user.civil_status?.toLowerCase().includes(keyword) ||
      user.contact_no?.toLowerCase().includes(keyword) ||
      userId.includes(keyword)
    );
  });

  // ✅ EDIT HANDLER
  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || user.user_name || '',
      email: user.email || user.email_ad || '',
      civil_status: user.civil_status || '',
      sex: user.sex || '',
      contact_no: user.contact_no || ''
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ UPDATE USER
  const handleUpdate = async () => {
    try {
      const targetId = selectedUser.id || selectedUser.userid;
      const token = localStorage.getItem('token'); 

      if (!token) throw new Error("Session expired. Please log in again.");

      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      // Update local state for instant feedback
      setUsers(prev => prev.map(u => 
        (u.id || u.userid) === targetId ? { ...u, ...form } : u
      ));

      setOpen(false);
      showSnack('User updated successfully');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  // ✅ DELETE HANDLERS
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const targetId = userToDelete.id || userToDelete.userid;
      const token = localStorage.getItem('token'); 

      if (!token) throw new Error("Authorization token missing.");

      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle 403 Forbidden specifically
      if (res.status === 403) {
        throw new Error('Forbidden: You do not have permission to delete records.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');

      // ✅ REMOVE FROM STATE IMMEDIATELY
      setUsers(prev => prev.filter(u => (u.id || u.userid) !== targetId));
      
      showSnack('User and all associated data deleted successfully');
    } catch (err) {
      showSnack(err.message, 'error');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSideBar />

      <Box sx={{ flexGrow: 1, ml: "90px", mt: "20px", p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#060745", fontWeight: "bold" }}>
          User Records
        </Typography>

        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <TextField
            fullWidth
            label="Search users by name, email, or ID..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Sex</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id || user.userid} hover>
                    <TableCell>{user.id || user.userid}</TableCell>
                    <TableCell>{user.name || user.user_name}</TableCell>
                    <TableCell>{user.email || user.email_ad}</TableCell>
                    <TableCell>{user.sex}</TableCell>
                    <TableCell>{user.civil_status}</TableCell>
                    <TableCell>{user.contact_no}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(user)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClick(user)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Update Resident Information</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email Address" name="email" value={form.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Sex" name="sex" value={form.sex} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Civil Status" name="civil_status" value={form.civil_status} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Contact Number" name="contact_no" value={form.contact_no} onChange={handleChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} color="primary">Update Resident</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>Permanent Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{userToDelete?.name || userToDelete?.user_name}</b>? 
            This will also permanently remove all their <b>requests, clearances, and reports</b> from the database.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Confirm Full Purge</Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICATIONS */}
      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={handleCloseSnack} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRecords;