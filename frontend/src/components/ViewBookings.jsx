import React, { useState, useEffect } from 'react';
import { fetchBookings } from '../api/api';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const loadBookings = async () => {
        const { data } = await fetchBookings(dateRange.startDate, dateRange.endDate);
        setBookings(data);
      };
      loadBookings();
    }
  }, [dateRange]);

  return (
    <div>
      <input type="date" placeholder="Start Date" onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} />
      <input type="date" placeholder="End Date" onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} />

      <ul>
        {bookings.map((booking) => (
          <li key={booking._id}>
            Room: {booking.room.roomNo}, Date: {new Date(booking.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewBookings;
