import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';

export const RoomCard = ({ room, onClick }) => {
    const cardStyle = {
        transition: 'box-shadow 0.3s ease', // Add smooth transition
      };
    
      const handleMouseEnter = (e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)'; // Add shadow on hover
      };
    
      const handleMouseLeave = (e) => {
        e.currentTarget.style.boxShadow = 'none'; // Remove shadow on mouse leave
      };

  return (
    <div className="col-md-4 mb-4 hover:shadow-sm p-3 mb-5 bg-body rounded">
      <div
        className="card"
        style={{...cardStyle, cursor: 'pointer'}}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onClick(room)}
        // style={{cursor: "pointer"}}
      >
        <div className="card-body">
          <h5 className="card-title">{room.roomName}</h5>
          <ul className="list-unstyled">
            <li><i className="bi bi-building"></i> Floor: {room.floorNo}</li>
            <li><i className="bi bi-people"></i> Capacity: {room.capacity}</li>
            <li>
              <i className="bi bi-projector"></i> Projector: {room.projector ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-danger"></i>}
            </li>
            <li>
              <i className="bi bi-tv"></i> TV Screen: {room.tvScreen ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-danger"></i>}
            </li>
            <li>
              <i className="bi bi-clipboard-check"></i> Whiteboard: {room.whiteboard ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-danger"></i>}
            </li>
            <li><i className="bi bi-telephone"></i> Ext: {room.extensionNumber}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}