import { motion } from "framer-motion";

export const RoomCard = ({ room, onClick }) => {
  // Darker gradient backgrounds
  const gradients = [
    "linear-gradient(to right, #2563EB, #047857)", // Blue 600 → Green 700
    "linear-gradient(to right, #7E22CE, #3730A3)", // Purple 600 → Indigo 800
    "linear-gradient(to right, #374151, #111827)", // Gray 700 → Gray 900
    "linear-gradient(to right, #0D9488, #0E7490)", // Teal 600 → Cyan 700
    // "linear-gradient(to right, #DC2626, #991B1B)", // Red 600 → Red 800
    "linear-gradient(to right, #CA8A04, #EA580C)", // Yellow 600 → Orange 700
    "linear-gradient(to right, #DB2777, #BE123C)", // Pink 600 → Rose 800
    "linear-gradient(to right, #1E40AF, #1E3A8A)", // Blue 800 → Blue 900
    "linear-gradient(to right, #15803D, #134E4A)", // Green 700 → Teal 900
    "linear-gradient(to right, #3730A3, #4C1D95)", // Indigo 800 → Purple 900
    "linear-gradient(to right, #EA580C, #991B1B)", // Orange 700 → Red 800
    "linear-gradient(to right, #65A30D, #065F46)", // Lime 600 → Emerald 800
  ];
  
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <motion.div
      className="col-md-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="card text-white shadow-lg border-0 p-3"
        style={{
          background: randomGradient,
          cursor: "pointer",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: 'box-shadow: 9px 11px 44px 0px rgba(187,204,250,1)'
        }}
        onClick={() => onClick(room)}
      >
        <div className="card-body text-center">
          {/* Title */}
          <h5 className="fw-bold" style={{ fontWeight: 600 }}>
            {room.roomName} (Floor - {room.floorNo})
          </h5>

          {/* Icons in a grid */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
            <div className="text-center">
              <i className="bi bi-people fs-4"></i>
              <p className="mb-0" style={{ fontWeight: 400 }}>Capacity: {room.capacity}</p>
            </div>
            <div className="text-center">
              <i className="bi bi-projector fs-4"></i>
              <p className="mb-0" style={{ fontWeight: 400 }}>
                Projector: {room.projector ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-danger"></i>}
              </p>
            </div>
            <div className="text-center">
              <i className="bi bi-tv fs-4"></i>
              <p className="mb-0" style={{ fontWeight: 400 }}>
                TV Screen: {room.tvScreen ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-danger"></i>}
              </p>
            </div>
            <div className="text-center">
              <i className="bi bi-clipboard-check fs-4"></i>
              <p className="mb-0" style={{ fontWeight: 400 }}>
                Whiteboard: {room.whiteboard ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-x-lg text-danger"></i>}
              </p>
            </div>
            <div className="text-center">
              <i className="bi bi-telephone fs-4"></i>
              <p className="mb-0" style={{ fontWeight: 400 }}>Ext: {room.extensionNumber || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
