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


// Response interceptor to handle 401 errors globally
API.interceptors.response.use(
  (response) => response, // For successful responses, just return the response
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove token from local storage (or wherever you store it)
      localStorage.removeItem('token');

      // Redirect to the home page (or login page)
      // Use window.location.href for immediate redirect (outside a component)
      window.location.href = '/';

      // OR, if you're inside a component and have access to useNavigate:
      // const navigate = useNavigate(); // Get the navigate function
      // navigate('/');

       // Optionally, display a message to the user
       // You could use a state variable in your component, a toast notification, etc.
       console.log('Authentication failed. Redirecting to home page.');
    }
    return Promise.reject(error); // Important: Re-reject the error for further handling
  }
);


// Rooms
export const fetchRooms = () => API.get('/rooms');


// Booking
export const bookRoom = (data) => API.post('/bookings/book', data);
export const getRoomBookingsByDateRange = (roomId, startDate, endDate) =>
  API.get(`/bookings/byDateRange?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}`);
export const fetchBookings = (startDate, endDate) =>
  API.get(`/bookings?startDate=${startDate}&endDate=${endDate}`);

export const cancelBooking = (id) => API.delete(`/bookings/${id}`);

export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);

export const searchUsers = (query) => API.post(`/ms-graph-util/search-user?query=${query}`);