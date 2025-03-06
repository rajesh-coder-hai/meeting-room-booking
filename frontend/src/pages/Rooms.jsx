import React from 'react';
import RoomTable from '../components/RoomTable';

const Rooms = () => {
  return (
    <div className="rooms-page">
      <h2 className='text-center'>Our Meeting Rooms</h2>
      <RoomTable />
    </div>
  );
};

export default Rooms;
