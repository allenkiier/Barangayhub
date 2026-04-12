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

  // ✅ SNACKBAR
  const showSnack = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  // ✅ FETCH USERS - Stabilized with useCallback to prevent infinite loops and build errors
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (!res.ok) throw new Error('Failed to fetch users from server');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showSnack(err.message, 'error');
    }
  }, [showSnack]);

  // ✅ EFFECT - Runs only when fetchUsers changes (which is never, due to empty dependency array in useCallback)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ SEARCH FILTER
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

  // ✅ EDIT
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

  // ✅ UPDATE
  const handleUpdate = async () => {
    try {
      // Use user.id or user.userid depending on your API response mapping
      const targetId = selectedUser.id || selectedUser.userid;
      const res = await fetch(
        `http://localhost:5000/api/users/${targetId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      setOpen(false);
      fetchUsers();
      showSnack('User updated successfully');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  // ✅ DELETE FLOW (OPEN DIALOG)
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // ✅ CONFIRM DELETE
  const handleConfirmDelete = async () => {
    try {
      const targetId = userToDelete.id || userToDelete.userid;
      const res = await fetch(
        `http://localhost:5000/api/users/${targetId}`,
        {
          method: 'DELETE'
        }
      );

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
    <div>
      <AdminSideBar />

      <Box sx={{ flex: 1, ml: "90px", mt: "20px", paddingRight: 2 }}>
        <Box sx={{ ml: "90px", mt: 3, pr: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ color: "#060745", fontWeight: "bold" }}>
            User Records
          </Typography>

          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>

            {/* SEARCH */}
            <TextField
              fullWidth
              label="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TableContainer sx={{ maxHeight: 450, overflowY: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Sex</TableCell>
                    <TableCell>Civil Status</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id || user.userid}>
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
                      <TableCell colSpan={7} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </Paper>
        </Box>
      </Box>

      {/* EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Sex" name="sex" value={form.sex} onChange={handleChange} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Civil Status" name="civil_status" value={form.civil_status} onChange={handleChange} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Contact No" name="contact_no" value={form.contact_no} onChange={handleChange} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ DELETE CONFIRM DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <b>{userToDelete?.name || userToDelete?.user_name}</b>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={handleCloseSnack}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserRecords;