import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { logoutFromMicrosoft } from '../api/api';

const Navbar = () => {
  // const navigate = useNavigate();
  const [isLoggedIn, setIsLogin] = useState(false);
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  };
  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
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
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav gap-2">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/rooms">
                <i className="bi bi-grid"></i> Rooms
              </Link>
            </li>
            <li className="nav-item">
              <a
                href={
                  isLoggedIn
                    ? `${import.meta.env.VITE_API_BASE_URL}/auth/logout`
                    : `${
                        import.meta.env.VITE_API_BASE_URL
                      }/auth/microsoft?token=${localStorage.getItem("token")}`
                }
                className="btn btn-link nav-link text-white"
                onClick={() => {
                  if (isLoggedIn) {
                    localStorage.clear(); // Clear all localStorage data on logout
                  }
                }}
              >
                <i className="bi bi-box-arrow-right"></i>{" "}
                {isLoggedIn ? "Logout" : "Login"}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
