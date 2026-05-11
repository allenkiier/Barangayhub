import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

// Icons
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

  // Notifications Helper
  const showSnack = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleCloseSnack = () => setSnack({ ...snack, open: false });

  // Fetch Data
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showSnack(err.message, 'error');
    }
  }, [showSnack]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const approved = users.filter(u => u.is_approved === 1);
    return {
      totalApproved: approved.length,
      admins: approved.filter(u => u.isAdmin === 1).length,
      residents: approved.filter(u => u.isAdmin === 0).length,
      pending: users.filter(u => !u.is_approved).length
    };
  }, [users]);

  // Handlers
  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/approve-user/${userId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve user');
      setUsers(prev => prev.map(u => (u.id || u.userid) === userId ? { ...u, is_approved: 1 } : u));
      showSnack('User accepted successfully!');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

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

  const handleUpdate = async () => {
    try {
      const targetId = selectedUser.id || selectedUser.userid;
      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Update failed');
      setUsers(prev => prev.map(u => (u.id || u.userid) === targetId ? { ...u, ...form } : u));
      setOpen(false);
      showSnack('User updated successfully');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const targetId = userToDelete.id || userToDelete.userid;
      const res = await fetch(`${API_URL}/api/users/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Deletion failed');
      setUsers(prev => prev.filter(u => (u.id || u.userid) !== targetId));
      showSnack('User purged successfully');
    } catch (err) {
      showSnack(err.message, 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    const name = (user.name || user.user_name || '').toLowerCase();
    const email = (user.email || user.email_ad || '').toLowerCase();
    const id = String(user.id || user.userid || '');
    return name.includes(keyword) || email.includes(keyword) || id.includes(keyword);
  });

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <AdminSideBar />

      <Box sx={{ flexGrow: 1, ml: "90px", p: 3 }}>
        <Typography variant="h4" sx={{ color: "#060745", fontWeight: "bold", mb: 3 }}>
          User Records & Management
        </Typography>

        {/* Summary Dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <StatCard title="Approved" value={stats.totalApproved} icon={<PeopleAltIcon color="success"/>} color="#2e7d32" />
          <StatCard title="Admins" value={stats.admins} icon={<AdminPanelSettingsIcon color="secondary"/>} color="#9c27b0" />
          <StatCard title="Residents" value={stats.residents} icon={<PersonIcon color="primary"/>} color="#1976d2" />
          <StatCard title="Pending" value={stats.pending} icon={<CheckCircleIcon color="warning"/>} color="#ed6c02" />
        </Grid>

        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <TextField
            placeholder="Search by Name, Email, or ID..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, width: '40%' }}
          />
          
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Type</TableCell>
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
                      <Chip 
                        label={user.isAdmin ? "Admin" : "Resident"} 
                        size="small" 
                        color={user.isAdmin ? "secondary" : "default"} 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_approved ? "ACCEPTED" : "PENDING"} 
                        color={user.is_approved ? "success" : "warning"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {!user.is_approved && (
                          <Tooltip title="Approve">
                            <IconButton onClick={() => handleApprove(user.id || user.userid)} color="success" size="small"><CheckCircleIcon/></IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(user)} color="primary" size="small"><EditIcon/></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => {setUserToDelete(user); setDeleteDialogOpen(true);}} color="error" size="small"><DeleteIcon/></IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Edit Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit User Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Sex" value={form.sex} onChange={(e) => setForm({...form, sex: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Civil Status" value={form.civil_status} onChange={(e) => setForm({...form, civil_status: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Contact No." value={form.contact_no} onChange={(e) => setForm({...form, contact_no: e.target.value})} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Permanent Delete?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <b>{userToDelete?.name || userToDelete?.user_name}</b>? This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Confirm Purge</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack}>
        <Alert severity={snack.severity} variant="filled">{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

// Helper Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ borderRadius: 3, borderLeft: `6px solid ${color}`, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon}
          <Typography color="textSecondary" variant="subtitle2">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      </CardContent>
    </Card>
  </Grid>
);

export default UserRecords;