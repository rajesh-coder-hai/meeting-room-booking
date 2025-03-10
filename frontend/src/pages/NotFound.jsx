// src/components/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

function NotFound({ header = "404 - Page Not Found", subtitle = "Oops! The page you're looking for doesn't exist." }) {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      {/* SVG (Replace with your actual SVG or use a placeholder) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="150"
        height="150"
        fill="currentColor"
        className="bi bi-exclamation-triangle-fill text-warning mb-4" // Bootstrap icon and color
        viewBox="0 0 16 16"
      >
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>

      <h1 className="display-4 fw-bold text-center mb-3">{header}</h1>
      <p className="lead text-center mb-4">{subtitle}</p>

      <button
        className="btn btn-primary btn-lg" // Bootstrap button classes
        onClick={() => navigate('/')}
      >
        Take Me Home
      </button>
    </div>
  );
}

export default NotFound;