// Create this in a separate file, e.g., lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: "https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/",
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
  }
});

export default api;