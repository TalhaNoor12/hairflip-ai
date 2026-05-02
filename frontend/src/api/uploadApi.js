import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 
                 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,  // 60 second timeout for AI generation
  headers: {
    'Content-Type': 'application/json',
  }
});

export async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  
  return response.data;
}
