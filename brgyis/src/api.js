import axios from 'axios';

// This logic handles the switch for you automatically
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'  // Your new local Backend port
  : 'https://your-backend-name.up.railway.app'; // Your Railway URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;