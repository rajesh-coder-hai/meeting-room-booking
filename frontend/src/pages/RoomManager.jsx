import React, { useCallback, useEffect, useState } from "react";
import { createRoom, fetchRooms, updateRoom, deleteRoom } from "../api/api";
import { RoomCard } from "../components/RoomCard";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import RoomForm from "./RoomForm";
import { Modal, Button } from "react-bootstrap";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { showSuccessToast } from "../store/slices/sharedSlice";
import DebouncedSearch from "../components/DebouncedSearch";

const RoomManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  const handleRoomSubmit = async (values, isCreatingNew) => {
    try {
      console.log("values", { values, isCreatingNew });
      if (isCreatingNew) {
        const { data: newRoom } = await createRoom(values);

        setRooms([...rooms, newRoom]);
      } else {
        const { data: updatedRoom } = await updateRoom(values);
        setRooms(
          rooms.map((r) => (r._id === updatedRoom._id ? updatedRoom : r))
        );
      }
      setShowModal(false); // Hide the modal after success
      dispatch(
        showSuccessToast(
          `Room ${isCreatingNew ? "created" : "updated"} successfully!`
        )
      );
    } catch (error) {
      console.error("Error submitting room:", error);
      // Optionally, show an error toast
    }
  };

  const handleDeleteRoom = async (iRoom) => {
    try {
      await deleteRoom(iRoom._id);
      setRooms(rooms.filter((room) => room._id !== iRoom._id));
      dispatch(showSuccessToast("Room removed successfully!"));
    } catch (error) {
      console.error("Error deleting room:", error);
      // Optionally, show an error toast
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRoom(null); // Clear selected room when closing
  };

  const handleSearchMeetingRoom = useCallback(async (searchTerm) => {
    console.log("Searching for:", searchTerm);
    // Perform your search logic here (e.g., API call)
    try {
      const { data: rooms } = await fetchRooms(`?search=${searchTerm}`);
      console.log("rooms handleSearchMeetingRoom", rooms);

      setRooms(rooms);
    } catch (error) {
      console.log("Error while searching meeting room:", error);
    }
  }, []);

  return (
    <div className="formWithCalender mt-5">
      {isAdmin && (
        <button
          className="btn btn-primary w-25 d-block mb-3 mx-auto"
          onClick={() => {
            setSelectedRoom(null);
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          {"Create New Room"}
        </button>
      )}

      <div className="mb-3">
        <DebouncedSearch onSearch={handleSearchMeetingRoom} delay={300} />
      </div>

      <div className="row">
        {rooms.map((room, index) => (
          <RoomCard
            key={index}
            room={room}
            isAdmin={isAdmin}
            onClick={(room) => navigate(`/bookings?roomId=${room._id}`)}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
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
