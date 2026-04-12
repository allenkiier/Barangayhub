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
    return (
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.sex?.toLowerCase().includes(keyword) ||
      user.civil_status?.toLowerCase().includes(keyword) ||
      user.contact_no?.toLowerCase().includes(keyword) ||
      String(user.id || user.userid).includes(keyword)
    );
  });

  // ✅ EDIT HANDLER
  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      civil_status: user.civil_status || '',
      sex: user.sex || '',
      contact_no: user.contact_no || ''
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ UPDATE USER (Requires Token)
  const handleUpdate = async () => {
    try {
      const targetId = selectedUser.id || selectedUser.userid;
      const token = localStorage.getItem('token'); 

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

      setOpen(false);
      fetchUsers();
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

      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Unauthorized: Admin access required.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Constraint Error: User has active records.');

      fetchUsers();
      showSnack('User deleted successfully');
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
            label="Search users..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sex</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Civil Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
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

      {/* EDIT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User Details</DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{userToDelete?.name || userToDelete?.user_name}</b>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Confirm Delete</Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICATIONS */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
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