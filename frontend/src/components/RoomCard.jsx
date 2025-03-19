import React from 'react';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure Bootstrap CSS is imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faUsers, faProjectDiagram, faTv, faChalkboard, faPhone, faEdit, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

export const RoomCard = ({ room, onClick, isAdmin, onEdit }) => { // Add isAdmin prop
  const gradients = [
    "linear-gradient(to right,rgb(82, 133, 245),rgb(20, 121, 92))",
    "linear-gradient(to right,rgb(178, 104, 243),rgb(51, 45, 145))",
    "linear-gradient(to right,rgb(53, 99, 173), #111827)",
    "linear-gradient(to right,rgb(43, 190, 178), #0E7490)",
    "linear-gradient(to right,rgb(253, 182, 28), #EA580C)",
    "linear-gradient(to right, #DB2777, #BE123C)",
    "linear-gradient(to right,rgb(61, 99, 226), #1E3A8A)",
    "linear-gradient(to right,rgb(58, 212, 115), #134E4A)",
    "linear-gradient(to right,rgb(92, 82, 219), #4C1D95)",
    "linear-gradient(to right,rgb(224, 122, 66), #991B1B)",
    "linear-gradient(to right,rgb(154, 218, 66), #065F46)",
  ];

  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <motion.div
      className="col-md-4 mb-4" // Bootstrap grid classes
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="card shadow-lg" // Bootstrap card and shadow
        style={{
          background: randomGradient,
          cursor: 'pointer',
          // borderRadius: '12px',
          overflow: 'hidden',
        }}
        onClick={() => onClick(room)} // Handle click on the card
      >
        <div className="card-header text-white text-center"> {/* Card Header */}
          <h5 className="fw-bold mb-0">
            {room.roomName} (Floor - {room.floorNo})
          </h5>
        </div>

        <div className="card-body text-white"> {/* Card Body */}
          <div className="row g-3"> {/* Use Bootstrap's grid for layout */}
            <div className="col-6 d-flex align-items-center">
                <FontAwesomeIcon icon={faUsers} className="me-2 fs-4" />
              <span>Capacity: {room.capacity}</span>
            </div>
            <div className="col-6 d-flex align-items-center">
              <FontAwesomeIcon icon={faProjectDiagram} className="me-2 fs-4" />
              <span>Projector: {room.projector ? 'Yes' : 'No'}</span>
            </div>
            <div className="col-6 d-flex align-items-center">
                <FontAwesomeIcon icon={faTv} className="me-2 fs-4" />
              <span>TV: {room.tvScreen ? 'Yes' : 'No'}</span>
            </div>
            <div className="col-6 d-flex align-items-center">
                <FontAwesomeIcon icon={faChalkboard} className="me-2 fs-4" />
             <span>Whiteboard: {room.whiteboard ? 'Yes' : 'No'}</span>
            </div>
            <div className="col-6 d-flex align-items-center">
              <FontAwesomeIcon icon={faPhone} className="me-2 fs-4" />
              <span>Ext: {room.extensionNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="card-footer text-center bg-transparent"> {/* Card Footer */}
          {isAdmin && (
            <button className="btn btn-outline-secondary me-2 text-white" onClick={(e)=>{
              e.stopPropagation();
              console.log('Edit room:', room);
              onEdit(room); // Handle edit button click
            }}>
                <FontAwesomeIcon icon={faEdit} className="me-2" />
              Edit
            </button>
          )}
          <button className="btn btn-primary">
          <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
          
            Book</button>
        </div>
      </div>
    </motion.div>
  );
};