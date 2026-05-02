import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 
                 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export async function analyseFaceShape(imageUrl) {
  const response = await api.post('/analyse-face', {
    imageUrl
  });
  return response.data;
}

export async function generateHairstyle(imageUrl, stylePrompt) {
  const response = await api.post('/generate-hairstyle', {
    imageUrl,
    stylePrompt
  });
  return response.data;
}
