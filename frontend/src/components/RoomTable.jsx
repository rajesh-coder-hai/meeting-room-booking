import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../api/api';
import { RoomCard } from './RoomCard';

const RoomTable = () => {
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
          <RoomCard key={index} room={room} onClick={(room) => console.log(room)}/>
        ))}
      </div>
    </div>
  );
};

export default RoomTable;
