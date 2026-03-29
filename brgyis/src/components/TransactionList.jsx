import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const Item = styled(Paper)(({ bgcolor }) => ({
  width: 200,
  height: 75,
  padding: 10,
  textAlign: 'left',
  color: '#fff',
  background: bgcolor,
  display: 'flex',
  gap:'5px',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  borderRadius: 12,
  cursor: 'pointer',
  transition: '0.2s',
  '&:hover': {
    transform: 'scale(1.03)',
    opacity: 0.9
  }
}));

const lightTheme = createTheme({
  palette: { mode: 'light' }
});

const colors = [
  'linear-gradient(134deg, rgba(25,118,210,1) 76%, rgba(240,240,240,1) 100%)',
  'linear-gradient(134deg,rgba(156, 39, 176, 1) 76%, rgba(237, 230, 230, 1) 100%)',
  'linear-gradient(134deg,rgba(46, 125, 50, 1) 76%, rgba(237, 230, 230, 1) 100%)',
  'linear-gradient(134deg,rgba(237, 108, 2, 1) 76%, rgba(237, 230, 230, 1) 100%)',
  'linear-gradient(134deg,rgba(211, 47, 47, 1) 76%, rgba(237, 230, 230, 1) 100%)',
  'linear-gradient(134deg,rgba(2, 136, 209, 1) 76%, rgba(237, 230, 230, 1) 100%)',
  'linear-gradient(134deg,rgba(106, 27, 154, 1) 76%, rgba(237, 230, 230, 1) 100%)'
];

const getColorById = (id) => {
  return colors[id % colors.length];
};

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error('Error fetching transactions:', err));
  }, []);

  return (
    <ThemeProvider theme={lightTheme}>
      <div>
        <h2>Transaction Lists</h2>

        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Grid container spacing={2} justifyContent="flex-start">
            {transactions.map((txn) => (
              <Grid item xs={12} sm={6} md={4} key={txn.trans_id}>
                <Item bgcolor={getColorById(txn.trans_id)}>
                  <EditDocumentIcon /> {txn.trans_name}
                </Item>
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default TransactionList;