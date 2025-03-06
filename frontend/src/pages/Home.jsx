import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div
      className="position-relative w-100 vh-100 bg-dark text-white"
      style={{
        backgroundImage: "url('/landingPage1.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex flex-column justify-content-center align-items-center text-center p-4">
        <motion.h1
          className="fw-bold display-4 mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Seamless Meeting Room Booking at Your Fingertips!
        </motion.h1>

        <motion.p
          className="lead mb-4 fw-semibold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Find and book meeting rooms instantly, hassle-free scheduling for your
          team.
        </motion.p>

        <div className="d-flex gap-3">
          <button className="btn btn-primary btn-lg" onClick={()=> navigate('/rooms')}>Find a Room</button>
          <button className="btn btn-outline-light btn-lg" onClick={()=> window.location.href= `${import.meta.env.VITE_API_BASE_URL}/auth/microsoft`}>
            <img
              src="/microsoft.svg" 
              alt="Microsoft Logo"
              style={{ height: "20px", marginRight: "10px" }} // Adjust size and spacing as needed
            />
            Login with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
