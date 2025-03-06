import React, { useEffect } from 'react';
import RoomTable from '../components/RoomTable';

const Rooms = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (token) {
            localStorage.setItem("token", token); // Store token
            window.history.replaceState({}, document.title, "/rooms"); 
        }
  },[])
  
  return (
    <div className="rooms-page">
      <h2 className='text-center'>Our Meeting Rooms</h2>
      <RoomTable />
    </div>
  );
};

export default Rooms;
