// Create this in a separate file, e.g., lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: "https://api.4pmti.com/",
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
  }
});

export default api;