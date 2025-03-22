const Room = require('../models/Room');

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    //if id in params, return room with that id
    if (req.params.id) {
      const
        room = await Room.findById(req.params.id);
      if (!room) return res.status(404).json({ message: 'Room not found' });
      return res.json(room);
    }
    //if search filter in query, return rooms that match the filter
    if (req.query.search) {
      const rooms = await Room.find({ roomName: { $regex: req.query.search, $options: 'i' } });
      return res.json(rooms);
    }
    //if floorNo in query, return rooms on that floor
    if (req.query.floorNo) {
      const rooms = await Room.find
        ({ floorNo: req.query.floorNo });
      return res.json(rooms);
    }
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching rooms', error });
  }
};

// Add a new room (for admins or room managers)
exports.addRoom = async (req, res) => {
  const {
    roomName,
    floorNo,
    capacity,
    projector,
    tvScreen,
    whiteboard, description } = req.body;
  try {
    const room = await Room.create({
      roomName,
      floorNo,
      capacity,
      projector,
      tvScreen,
      whiteboard, description
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: 'Error adding room', error });
  }
};

exports.bulkUploadRooms = async (req, res) => {
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

//update existing room
exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const {

    // "roomName", //let's not update the room number for now
    floorNo,
    capacity,
    projector,
    tvScreen,
    whiteboard,
    description

  } = req.body;
  try {
    const room = await Room.findOneAndUpdate(
      { _id: id },
      {
        floorNo,
        capacity,
        projector,
        tvScreen,
        whiteboard, description
      },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: 'Error updating room', error });
  }
};

//delete existing room
exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findOneAndDelete({ _id: id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting room', error });
  }
};