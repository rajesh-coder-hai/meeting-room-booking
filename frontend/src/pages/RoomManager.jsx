import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// --- MUI Imports ---
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Alert,
  Box,
  Button, // Optional: For header content
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
// --- End MUI Imports ---

// --- Your Component Imports ---
import DebouncedSearch from "../components/DebouncedSearch"; // Assuming uses MUI TextField
import Filters from "../components/Filters"; // Assuming uses MUI controls
import { RoomCard } from "../components/RoomCard"; // Assuming uses MUI
import RoomForm from "./RoomForm"; // Assuming uses MUI
// --- End Your Component Imports ---

// --- Your API functions and Redux actions ---
import { createRoom, deleteRoom, fetchRooms, updateRoom } from "../api/api";
import { showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";
// --- End API/Redux ---

const RoomManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useSelector((state) => state.shared);
  // const theme = useTheme(); // Access theme for breakpoints
  const isSmallScreen = false; // useMediaQuery(theme.breakpoints.down("sm")); // Check for small screens

  // --- State ---
  const [appliedRoomFilters, setAppliedRoomFilters] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  // --- End State ---

  // --- Logic (Keep existing logic, ensure useCallback deps are correct) ---
  const loadRooms = useCallback(
    async (queryParams = "") => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchRooms(queryParams); // Pass query params if needed
        setRooms(data);
      } catch (err) {
        console.error("Error loading rooms:", err);
        const errorMsg = err.response?.data?.message || "Failed to load rooms.";
        setError(errorMsg);
        dispatch(showErrorToast(errorMsg));
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  ); // Add dispatch

  useEffect(() => {
    // Handle token from URL (keep as is)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const refreshToken = urlParams.get("refreshToken");
    if (token) {
      localStorage.setItem("token", token);
      sessionStorage.setItem("refreshToken", refreshToken);
      window.history.replaceState({}, document.title, "/rooms"); // Clean URL
    }
    // Initial load
    loadRooms();
  }, [loadRooms]); // Load rooms on mount

  const handleOpenFormDialog = (room = null) => {
    if (room) {
      setSelectedRoom(room);
      setIsCreatingNew(false);
    } else {
      setSelectedRoom(null);
      setIsCreatingNew(true);
    }
    setShowFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setShowFormDialog(false);
    setSelectedRoom(null); // Clear selection on close
  };

  const handleRoomSubmit = async (values, creatingNew) => {
    // Renamed param
    try {
      let message = "";
      if (creatingNew) {
        await createRoom(values);
        message = "Room created successfully!";
      } else {
        // Ensure ID is included for update
        if (!selectedRoom?._id) throw new Error("No room selected for update.");
        await updateRoom({ ...values, _id: selectedRoom._id });
        message = "Room updated successfully!";
      }
      setShowFormDialog(false);
      dispatch(showSuccessToast(message));
      loadRooms(); // Refresh the room list
    } catch (error) {
      console.error("Error submitting room:", error);
      const errorMsg =
        error.response?.data?.message ||
        `Failed to ${creatingNew ? "create" : "update"} room.`;
      dispatch(showErrorToast(errorMsg));
      // Keep dialog open on error? Or close? User preference.
      // setShowFormDialog(false);
    }
  };

  const handleOpenDeleteConfirm = (room) => {
    setRoomToDelete(room);
    setShowDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setRoomToDelete(null);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await deleteRoom(roomToDelete._id);
      // Optimistic UI update or refetch
      setRooms((prevRooms) =>
        prevRooms.filter((room) => room._id !== roomToDelete._id)
      );
      dispatch(showSuccessToast("Room removed successfully!"));
    } catch (error) {
      console.error("Error deleting room:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete room.";
      dispatch(showErrorToast(errorMsg));
    } finally {
      handleCloseDeleteConfirm(); // Close confirmation dialog
    }
  };

  const handleSearchMeetingRoom = useCallback(
    (searchTerm) => {
      console.log("Searching for:", searchTerm);
      loadRooms(`?search=${encodeURIComponent(searchTerm)}`);
    },
    [loadRooms]
  );

  // const handleFilterChange = useCallback(
  //   (filterData) => {
  //     console.log("Applying filters:", filterData);
  //     // Convert filterData object to query string (handle complex objects if needed)
  //     const filterQuery = Object.entries(filterData)
  //       .map(
  //         ([key, value]) =>
  //           `${encodeURIComponent(key)}=${encodeURIComponent(
  //             JSON.stringify(value)
  //           )}`
  //       ) // Example serialization
  //       .join("&");
  //     loadRooms(`?${filterQuery}`);
  //     setFilterDrawerOpen(false); // Close drawer after applying
  //   },
  //   [loadRooms]
  // );

  const handleApplyRoomFilters = useCallback(
    (newFilters) => {
      console.log("Applying filters in RoomManager:", newFilters);
      setAppliedRoomFilters(newFilters); // Update the parent's state

      const filterQuery = Object.entries(newFilters)
        // Filter out null, undefined, empty strings. Keep empty arrays *if* your backend handles them, otherwise filter them too.
        .filter(
          ([key, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            (!Array.isArray(value) || value.length > 0)
        )
        .map(([key, value]) => {
          let encodedValue;
          // Check if it's an array (or potentially a plain object you want to stringify)
          if (
            Array.isArray(value) ||
            (typeof value === "object" &&
              value !== null &&
              value.constructor === Object)
          ) {
            // Stringify and encode arrays/objects
            encodedValue = encodeURIComponent(JSON.stringify(value));
          } else {
            // Directly encode primitive values (string, number, boolean)
            encodedValue = encodeURIComponent(value.toString()); // Convert boolean/number to string first
          }
          return `${encodeURIComponent(key)}=${encodedValue}`;
        })
        .join("&");

      console.log("Generated Filter Query String:", filterQuery); // Log the result

      loadRooms(`?${filterQuery}`); // Assuming loadRooms appends this query string
      setFilterDrawerOpen(false); // Close drawer
    },
    [loadRooms, setAppliedRoomFilters, setFilterDrawerOpen]
  ); // Add state setters to dependencies if they come from props/context

  const handleCardClick = (room) => {
    navigate(`/bookings?roomId=${room._id}`);
  };
  // --- End Logic ---

  return (
    <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
      {/* Optional Header Bar */}
      {/* <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Room Management
                    </Typography>
                    {isAdmin && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenFormDialog()}>
                            Create Room
                        </Button>
                    )}
                </Toolbar>
            </AppBar> */}

      {/* Simplified Header / Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Meeting Rooms
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <DebouncedSearch
            onSearch={handleSearchMeetingRoom}
            delay={500}
            sx={{ minWidth: "250px" }}
          />{" "}
          {/* Assuming DebounceSearch uses MUI TextField */}
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDrawerOpen(true)}
          >
            Filters
          </Button>
          {isAdmin && (
            <Button
              sx={{ minWidth: "180px" }}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenFormDialog()}
            >
              Create Room
            </Button>
          )}
        </Stack>
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: { xs: "80vw", sm: 350 }, p: 2 }} role="presentation">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Ensure Filters component uses MUI controls */}
          <Filters
            filterName="roomFilter"
            appliedFilters={appliedRoomFilters} // Pass current filters down
            onApplyFilters={handleApplyRoomFilters} // Pass the new handler
          />
        </Box>
      </Drawer>

      {/* Room Card Grid */}
      <Box
        sx={{
          flexGrow: 1 /* Allow grid to take available space */,
          padding: "0 10px", // Optional padding
          height: "calc(100vh - 170px)", // Adjust height as needed
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        )}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && !error && rooms.length === 0 && (
          <Typography
            sx={{ textAlign: "center", p: 5, color: "text.secondary" }}
          >
            No meeting rooms found matching your criteria.
          </Typography>
        )}
        {!loading && !error && rooms.length > 0 && (
          <Grid container spacing={3}>
            {rooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
                <RoomCard
                  room={room}
                  isAdmin={isAdmin}
                  onClick={handleCardClick} // Navigate on main click
                  onEdit={handleOpenFormDialog} // Open dialog for edit
                  onDelete={handleOpenDeleteConfirm} // Open confirmation for delete
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create/Edit Room Dialog (MUI) */}
      <Dialog
        open={showFormDialog}
        onClose={handleCloseFormDialog}
        maxWidth="md" // Adjust as needed
        fullWidth // Takes available width up to maxWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isCreatingNew
            ? "Create New Room"
            : `Edit Room: ${selectedRoom?.roomName || ""}`}
          <IconButton aria-label="close" onClick={handleCloseFormDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {" "}
          {/* Adds padding and dividers */}
          {/* Ensure RoomForm uses MUI controls */}
          <RoomForm
            room={selectedRoom}
            onSubmit={handleRoomSubmit}
            onCancel={handleCloseFormDialog}
            key={selectedRoom?._id || "new"} // Force re-render/reset on change
          />
        </DialogContent>
        {/* Actions can be included within RoomForm's submit/cancel buttons */}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-description"
      >
        <DialogTitle id="delete-confirm-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-description">
            Are you sure you want to permanently delete the room "
            {roomToDelete?.roomName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteConfirm}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteRoom}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoomManager;
