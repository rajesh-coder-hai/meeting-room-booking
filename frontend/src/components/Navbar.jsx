import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { logoutFromMicrosoft } from '../api/api';

const Navbar = () => {
  // const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }
useEffect(() => {
  checkLoginStatus()
},[])

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-house-door"></i> Meeting Room Booking
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
     
            <li className="nav-item">
              <Link className="nav-link" to="/rooms">
                <i className="bi bi-grid"></i> Rooms
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/bookings">
                <i className="bi bi-calendar-check"></i> Bookings
              </Link>
            </li> */}
            <li className="nav-item">
              <a href={isLogin ? `${import.meta.env.VITE_API_BASE_URL}/auth/logout` : `${import.meta.env.VITE_API_BASE_URL}/auth/microsoft?token=${localStorage.getItem('token')}`} className="btn btn-link nav-link" >
                <i className="bi bi-box-arrow-right"></i> {isLogin ? "Logout" : "Login"}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;