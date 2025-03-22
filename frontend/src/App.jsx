import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
// import Rooms from "./pages/RoomManager";
// import AppHeader from "./components/AppHeader";
// import { Provider } from "react-redux";
import "./styles/customStyle.css";
// import store from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS!
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar_1";
import { userProfile } from "./api/api";
import { useDispatch } from "react-redux";
import { setProfile } from "./store/slices/sharedSlice";
import RoomManager from "./pages/RoomManager";
const App = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const getUserProfile = async () => {
    try {
      const { data } = await userProfile();
      dispatch(setProfile(data));
    } catch (error) {
      console.log("error fetching profile", error);
    }
  };
  useEffect(() => {
    if (!token) {
      return;
    }
    getUserProfile();
  }, [token]);

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* <AppHeader /> */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/rooms" element={<RoomManager />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
