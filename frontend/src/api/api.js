import axios from "axios";

// Create axios instance with base URL
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

// Automatically add JWT token to request headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers["Content-Type"] = "application/json";
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
      localStorage.removeItem("token");

      // Redirect to the home page (or login page)
      // Use window.location.href for immediate redirect (outside a component)
      window.location.href = "/";

      // OR, if you're inside a component and have access to useNavigate:
      // const navigate = useNavigate(); // Get the navigate function
      // navigate('/');

      // Optionally, display a message to the user
      // You could use a state variable in your component, a toast notification, etc.
      console.log("Authentication failed. Redirecting to home page.");
    }
    return Promise.reject(error); // Important: Re-reject the error for further handling
  }
);

// Rooms
export const fetchRooms = (params) => API.get(`/rooms${params ?? ""}`);

export const createRoom = (data) => API.post("/rooms", data);
export const updateRoom = (data) => API.put(`/rooms/${data._id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

// Booking
export const bookRoom = (data) => API.post("/bookings/book", data);
export const getRoomBookingsByDateRange = (roomId, identifier) =>
  API.get(`/bookings/byDateRange?roomId=${roomId}&identifier=${identifier}`);
export const fetchBookings = (startDate, endDate) =>
  API.get(`/bookings?startDate=${startDate}&endDate=${endDate}`);

export const cancelBooking = (id) => API.delete(`/bookings/${id}`);

export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);

// Users

export const searchUsers = (query) =>
  API.post(`/ms-graph-util/search-user?query=${query}`);

export const userProfile = () => API.get("/users/profile");

//CRUD for favourite

export const createFavourite = (data) => API.post("/favorites", data);
export const updateFavourite = (id, data) => API.put(`/favorites/${id}`, data);
export const deleteFavourite = (id) => API.delete(`/favorites/${id}`);
export const getAllFavorites = () => API.get("/favorites");
export const getFavoritesById = (id) => API.get(`/favorites/${id}`);

//get filter for room
export const getFilterConfigForRoom = (filterName) =>
  API.get(`/configs?name=${filterName}`);

// Catering
// --- Menu Item Endpoints ---
export const fetchMenuItemsUser = () => API.get("/menu");
export const fetchMenuItemsAdmin = () => API.get("/menu/admin");
export const createMenuItem = (data) => API.post("/menu", data); // Use FormData for image uploads
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data); // Use FormData for image uploads
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// --- Order Endpoints ---
export const placeOrder = (orderData) => API.post("/orders", orderData);
export const getMyOrderHistory = () => API.get("/orders/my-history");
export const getAllOrdersAdmin = () => API.get("/orders/all");

// --- Meeting Room Endpoint ---
export const fetchMeetingRooms = () => API.get("/meeting-rooms");

// --- Utility for handling file uploads with other data ---
// You'll need this for creating/updating menu items with images
export const createMenuItemWithImage = async (menuItemData) => {
  const formData = new FormData();
  Object.keys(menuItemData).forEach((key) => {
    // Handle object data like customizableOptions - stringify them
    if (
      typeof menuItemData[key] === "object" &&
      !(menuItemData[key] instanceof File)
    ) {
      formData.append(key, JSON.stringify(menuItemData[key]));
    } else {
      formData.append(key, menuItemData[key]); // Append file or other primitive data
    }
  });

  return API.post("/menu", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Important for file uploads
    },
  });
};

export const updateMenuItemWithImage = async (id, menuItemData) => {
  const formData = new FormData();
  Object.keys(menuItemData).forEach((key) => {
    if (
      typeof menuItemData[key] === "object" &&
      !(menuItemData[key] instanceof File)
    ) {
      formData.append(key, JSON.stringify(menuItemData[key]));
    } else if (menuItemData[key] !== undefined) {
      // Avoid appending undefined file fields
      formData.append(key, menuItemData[key]);
    }
  });
  return API.put(`/menu/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
