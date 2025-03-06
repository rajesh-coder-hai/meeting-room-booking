import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({ baseURL: `${import.meta.env.VITE_API_BASE_URL}/api` });

// Automatically add JWT token to request headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers['Content-Type'] = 'application/json';
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Rooms
export const fetchRooms = () => API.get('/rooms');

// Booking
export const bookRoom = (data) => API.post('/bookings/book', data);
export const fetchBookings = (startDate, endDate) =>
  API.get(`/bookings?startDate=${startDate}&endDate=${endDate}`);
export const cancelBooking = (id) => API.delete(`/bookings/${id}`);

//Logout
// export const logoutFromMicrosoft =()=> axios.get('http://localhost:5000/auth/logout'); // not needed as of now
