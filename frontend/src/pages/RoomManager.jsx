import React, { useEffect, useState } from "react";
import { fetchRooms } from "../api/api";
import { RoomCard } from "../components/RoomCard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import RoomForm from "./RoomForm";
import { Modal, Button } from "react-bootstrap";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RoomManager = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSelector((state) => state.shared);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const refreshToken = urlParams.get("refreshToken");

    if (token) {
      localStorage.setItem("token", token); // Store token
      sessionStorage.setItem("refreshToken", refreshToken); // Store refresh token
      window.history.replaceState({}, document.title, "/rooms");
    }
  }, []);

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const loadRooms = async () => {
      const { data } = await fetchRooms();
      setRooms(data);
    };
    loadRooms();
  }, []);

  const [selectedRoom, setSelectedRoom] = useState(null); // Track the selected room for editing
  const [showModal, setShowModal] = useState(false);
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    // setIsCreatingNew(false); // Set to edit mode
    setShowModal(true); // Show the modal
  };

  // const handleCreateRoom = () => {
  //     setSelectedRoom(null); // Clear any selected room
  //     setIsCreatingNew(true);  // Set to create mode
  //     setShowModal(true);       // Show the modal
  // };

  const handleRoomSubmit = async (values, isCreatingNew) => {
    try {
      console.log("values", values);
      // if (isCreatingNew) {
      //     const newRoom = await createRoom(values);
      //     setRooms([...rooms, newRoom]);
      // } else {
      //     const updatedRoom = await updateRoom(values);
      //     setRooms(rooms.map(r => r._id === updatedRoom._id ? updatedRoom : r));
      // }
      setShowModal(false); // Hide the modal after success
      // Optionally, show a success toast
    } catch (error) {
      console.error("Error submitting room:", error);
      // Optionally, show an error toast
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null); // Clear selected room when closing
  };

  console.log("selectedRoom", selectedRoom);

  return (
    <div className="container mt-5">
     {isAdmin && ( <button
        className="btn btn-primary w-25 d-block mb-3 mx-auto"
        onClick={() => {
          setSelectedRoom(null);
          setShowModal(true);
        }}
      >
        <FontAwesomeIcon icon={faPlus} className="me-2" />
        {"Create New Room"}
      </button>)}

      <div className="row">
        {rooms.map((room, index) => (
          <RoomCard
            key={index}
            room={room}
            isAdmin={isAdmin}
            onClick={(room) => navigate(`/bookings?roomId=${room._id}`)}
            onEdit={handleEditRoom}
          />
        ))}

        {showModal && (
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>
                {!selectedRoom ? "Create New Room" : "Edit Room"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <RoomForm
                room={selectedRoom}
                onSubmit={handleRoomSubmit}
                onCancel={handleCloseModal}
              />
            </Modal.Body>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default RoomManager;
