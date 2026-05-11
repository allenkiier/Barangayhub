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
  Alert,
  Chip
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserRecords = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // DELETE CONFIRM STATE
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

  // SNACKBAR HELPER
  const showSnack = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  // FETCH USERS
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

  // INITIAL LOAD
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // APPROVE USER HANDLER
  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/approve-user/${userId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to approve user');

      setUsers(prev => prev.map(u => 
        (u.id || u.userid) === userId ? { ...u, is_approved: 1 } : u
      ));
      showSnack('User accepted successfully!');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  // SEARCH FILTER LOGIC
  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const userId = String(user.id || user.userid || '');
    const userName = (user.name || user.user_name || '').toLowerCase();
    const userEmail = (user.email || user.email_ad || '').toLowerCase();

    return (
      userName.includes(keyword) ||
      userEmail.includes(keyword) ||
      userId.includes(keyword)
    );
  });

  // EDIT HANDLER
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

  // UPDATE USER
  const handleUpdate = async () => {
    try {
      const targetId = selectedUser.id || selectedUser.userid;
      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Update failed');

      setUsers(prev => prev.map(u => 
        (u.id || u.userid) === targetId ? { ...u, ...form } : u
      ));

      setOpen(false);
      showSnack('User updated successfully');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  // DELETE HANDLERS
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

      if (!res.ok) throw new Error('Deletion failed');

      setUsers(prev => prev.filter(u => (u.id || u.userid) !== targetId));
      showSnack('User and all associated data purged');
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
            label="Search residents..."
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
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id || user.userid} hover>
                    <TableCell>{user.id || user.userid}</TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{user.name || user.user_name}</TableCell>
                    <TableCell>{user.email || user.email_ad}</TableCell>
                    <TableCell>
                      {user.isAdmin ? 
                        <Chip icon={<AdminPanelSettingsIcon />} label="Admin" color="secondary" size="small" variant="outlined" /> : 
                        <Chip icon={<PersonIcon />} label="Resident" size="small" variant="outlined" />
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_approved ? "ACCEPTED" : "PENDING"} 
                        color={user.is_approved ? "success" : "warning"} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!user.is_approved && (
                          <Tooltip title="Accept User">
                            <IconButton onClick={() => handleApprove(user.id || user.userid)} color="success">
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No records found.</TableCell>
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
            This will also permanently remove all their <b>requests, clearances, and reports</b>.
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
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={handleCloseSnack}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRecords;import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Alert,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UserRecords = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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

  const showSnack = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const approved = users.filter(u => u.is_approved === 1);
    return {
      totalApproved: approved.length,
      admins: approved.filter(u => u.isAdmin === 1).length,
      residents: approved.filter(u => u.isAdmin === 0).length,
      pending: users.filter(u => !u.is_approved).length
    };
  }, [users]);

  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/approve-user/${userId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to approve user');

      setUsers(prev => prev.map(u => 
        (u.id || u.userid) === userId ? { ...u, is_approved: 1 } : u
      ));
      showSnack('User accepted successfully!');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const userId = String(user.id || user.userid || '');
    const userName = (user.name || user.user_name || '').toLowerCase();
    const userEmail = (user.email || user.email_ad || '').toLowerCase();

    return (
      userName.includes(keyword) ||
      userEmail.includes(keyword) ||
      userId.includes(keyword)
    );
  });

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

  const handleUpdate = async () => {
    try {
      const targetId = selectedUser.id || selectedUser.userid;
      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Update failed');

      setUsers(prev => prev.map(u => 
        (u.id || u.userid) === targetId ? { ...u, ...form } : u
      ));

      setOpen(false);
      showSnack('User updated successfully');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

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

      if (!res.ok) throw new Error('Deletion failed');

      setUsers(prev => prev.filter(u => (u.id || u.userid) !== targetId));
      showSnack('User and all associated data purged');
    } catch (err) {
      showSnack(err.message, 'error');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <AdminSideBar />

      <Box sx={{ flexGrow: 1, ml: "90px", mt: "20px", p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "#060745", fontWeight: "bold", mb: 3 }}>
          User Records & Management
        </Typography>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '5px solid #2e7d32' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleAltIcon color="success" />
                  <Typography color="textSecondary" variant="subtitle2">Total Approved</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalApproved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '5px solid #9c27b0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettingsIcon color="secondary" />
                  <Typography color="textSecondary" variant="subtitle2">Admins</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.admins}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '5px solid #1976d2' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography color="textSecondary" variant="subtitle2">Residents</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.residents}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, borderLeft: '5px solid #ed6c02' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="warning" />
                  <Typography color="textSecondary" variant="subtitle2">Pending Review</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Search by ID, Name, or Email..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: '40%' }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <TableContainer sx={{ maxHeight: 550 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>User ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Account Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id || user.userid} hover>
                    <TableCell>#{user.id || user.userid}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{user.name || user.user_name}</TableCell>
                    <TableCell>{user.email || user.email_ad}</TableCell>
                    <TableCell>
                      {user.isAdmin ? 
                        <Chip icon={<AdminPanelSettingsIcon />} label="Admin" color="secondary" size="small" /> : 
                        <Chip icon={<PersonIcon />} label="Resident" color="primary" variant="outlined" size="small" />
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_approved ? "ACCEPTED" : "PENDING"} 
                        color={user.is_approved ? "success" : "warning"} 
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {!user.is_approved && (
                          <Tooltip title="Approve Access">
                            <IconButton onClick={() => handleApprove(user.id || user.userid)} color="success" size="small">
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit Profile">
                          <IconButton onClick={() => handleEdit(user)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Purge Account">
                          <IconButton onClick={() => handleDeleteClick(user)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="textSecondary">No user records match your search criteria.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* DIALOGS (Keep your existing Edit/Delete Dialogs here) */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Update User Information</DialogTitle>
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
          <Button variant="contained" onClick={handleUpdate} color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>Confirm Permanent Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{userToDelete?.name || userToDelete?.user_name}</b>? 
            This action will purge all associated requests and records from the database.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Purge Record</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={handleCloseSnack}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserRecords;