import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../api/api';
import { RoomCard } from '../components/RoomCard';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const refreshToken = urlParams.get("refreshToken");

        if (token) {
            localStorage.setItem("token", token); // Store token
            sessionStorage.setItem("refreshToken", refreshToken); // Store refresh token
            window.history.replaceState({}, document.title, "/rooms"); 
        }
  },[])
  
   const [rooms, setRooms] = useState([]);
  
    useEffect(() => {
      const loadRooms = async () => {
        const { data } = await fetchRooms();
        setRooms(data);
      };
      loadRooms();
    }, []);
  
    return (
      <div className="container mt-5">
        <div className="row">
          {rooms.map((room, index) => (
            <RoomCard 
            key={index}
             room={room} 
            onClick={(room) => navigate(`/bookings?roomId=${room._id}`)}
            />
          ))}
        </div>
      </div>
    );
};

export default Rooms;
