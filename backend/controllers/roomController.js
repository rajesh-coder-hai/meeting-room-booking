const CoreConfiguration = require('../models/CoreConfiguration');
const Room = require('../models/Room');
const handleApiError = require('../utils/errorHandler');

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const query = {};
    const search = req.query.search || '';
    console.log('search value hai******', search);

    // Boolean example
    if (req.query.projector !== undefined) {
      query.projector = req.query.projector === 'true'; // Convert string 'true' to boolean
    }

    // Array example (Floor)
    if (req.query.floorNo) {
      try {
        const floors = JSON.parse(req.query.floorNo); // Parse the JSON string
        if (Array.isArray(floors) && floors.length > 0) {
          query.floorNo = { $in: floors.map(Number) }; // Use $in with parsed numbers
        }
      } catch (e) {
        console.warn("Failed to parse floorNo query param:", req.query.floorNo);
        // Handle potential JSON parse error - maybe return 400 Bad Request
      }
    }

    // Range example (Capacity)
    if (req.query.capacity) {
      try {
        const capacityRange = JSON.parse(req.query.capacity);
        if (Array.isArray(capacityRange) && capacityRange.length === 2) {
          query.capacity = {};
          if (capacityRange[0] !== null && capacityRange[0] > 0) {
            query.capacity.$gte = Number(capacityRange[0]);
          }
          if (capacityRange[1] !== null && capacityRange[1] < Infinity) {
            query.capacity.$lte = Number(capacityRange[1]);
          }
          // If $gte or $lte was not added, remove the empty capacity object
          if (Object.keys(query.capacity).length === 0) {
            delete query.capacity;
          }
        }
      } catch (e) {
        console.warn("Failed to parse capacity query param:", req.query.capacity);
      }
    }

    console.log("Backend Mongoose Query:", query);
    const rooms = await Room.find(query); // Use the constructed query
    res.json(rooms);
  } catch (error) {
    handleApiError(error, res, "error fetching rooms");
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
    handleApiError(error, res, "error creating room");
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
    handleApiError(error, res, "error uploading bulk rooms");
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
    handleApiError(error, res, "error updating room");
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
    handleApiError(error, res, "error deleting room");
  }
};

exports.filterDataForRoom = async (req, res) => {
  try {
    const configName = req.query.configName || 'roomFilter'; // Default to "roomFilter"

    const filterConfig = await CoreConfiguration.findOne({ name: configName, active: true });

    if (!filterConfig) {
      return res.status(404).json({ message: 'Filter configuration not found or inactive' });
    }

    if (filterConfig.type !== 'filter') {
      return res.status(400).json({ message: 'Invalid configuration type. Expected "filter".' });
    }

    const configData = filterConfig.configData;
    const query = {};

    // --- Build the query based on configData ---

    // Boolean Filters
    if (configData.projector && configData.projector.value !== null) {
      query.projector = configData.projector.value;
    }
    if (configData.tvScreen && configData.tvScreen.value !== null) {
      query.tvScreen = configData.tvScreen.value;
    }
    if (configData.whiteboard && configData.whiteboard.value !== null) {
      query.whiteboard = configData.whiteboard.value;
    }

    // Floor Filter
    if (configData.floorNo && configData.floorNo.value && configData.floorNo.value.length > 0) {
      query.floorNo = { $in: configData.floorNo.value };
    }

    // Capacity Filter
    if (configData.capacity && configData.capacity.value) {
      if (configData.capacity.value[0] > 0 || configData.capacity.value[1] < Infinity) {
        query.capacity = {};
        if (configData.capacity.value[0] > 0) {
          query.capacity.$gte = configData.capacity.value[0];
        }
        if (configData.capacity.value[1] < Infinity) {
          query.capacity.$lte = configData.capacity.value[1];
        }
      }
    }

    const rooms = await Room.find(query);
    res.status(200).json(rooms);

  } catch (error) {
    console.error('Error fetching filtered rooms:', error);
    handleApiError(error, res, "error fetching filtered rooms");
  }
};    