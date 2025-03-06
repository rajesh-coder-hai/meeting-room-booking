const Room = require('../models/Room');

// Get all rooms
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching rooms', error });
    }
};

// Add a new room (for admins or room managers)
exports.addRoom = async (req, res) => {
    const { floorNo, roomNo, facilities, capacity } = req.body;
    try {
        const room = await Room.create({ floorNo, roomNo, facilities, capacity });
        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({ message: 'Error adding room', error });
    }
};

exports.bulkUploadRooms =  async (req, res) => {
    const roomsArray = req.body; // Expecting an array of room objects
  console.log('checking the input for roomsarry', roomsArray);
  
    try {
      // Validate and ensure uniqueness for each room
      // for (let roomData of roomsArray) {
      //   const { roomName, floorNo } = roomData;
  
      //   // Check if a room with the same name and floor exists
      //   const existingRoom = await Room.findOne({ roomName, floorNo });
      //   console.log('checking existing room', existingRoom);
        
      //   if (existingRoom) {
      //     return res.status(400).json({ message: `Room with name ${roomName} on floor ${floorNo} already exists.` });
      //   }
      // }
  
      // If all rooms are unique, proceed with the bulk insert
      await Room.insertMany(roomsArray,);
      res.status(201).json({ message: 'Rooms uploaded successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading rooms', error });
    }
  };