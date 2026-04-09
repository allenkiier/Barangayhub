const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-on-railway.up.railway.app' 
  : 'http://localhost:5000'; // Match your new backend port

export default API_BASE_URL;