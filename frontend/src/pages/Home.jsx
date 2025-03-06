import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <h1>Welcome to the Meeting Room Booking App</h1>
      <p>Please use the navigation bar to register, log in, or view available meeting rooms and your bookings.</p>
      <div className="quick-links">
        <Link to="/login">Login</Link> | <Link to="/register">Register</Link> | <Link to="/rooms">View Rooms</Link> | <Link to="/bookings">My Bookings</Link>
      </div>
    </div>
  );
};

export default Home;
