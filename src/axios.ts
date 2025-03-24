import axios from 'axios';

// TODO move to .env
const BASE_URL = 'http://localhost:3000';

export const publicAxios = axios.create({
  baseURL: BASE_URL,
});

export const privateAxios = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
