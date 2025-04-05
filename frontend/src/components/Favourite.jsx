// src/components/Favorites.jsx
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import EditIcon from "@mui/icons-material/Edit";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog, // For confirmation dialog
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack, // Import Stack for layout
  Divider, // Import Divider if you want it between items
  Modal,
  TextField,
  Typography,
  ListItemSecondaryAction,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  createFavourite,
  deleteFavourite,
  getAllFavorites,
  updateFavourite,
} from "../api/api"; // Your API functions
import { showErrorToast, showSuccessToast } from "../store/slices/sharedSlice";
// import UserSearch from "./UserSearch"; // Assuming you have this component

function Favorites({ attendees = [], oSelectedAttendees = [] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFavorite, setSelectedFavorite] = useState(attendees); // For editing/deleting
  const [selectedUsers, setSelectedUsers] = useState([]); // Users for the *current* (new or edited) favorite list
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For confirmation

  const dispatch = useDispatch();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleAddClick = () => {
    setSelectedUsers([]); // Clear selected users when creating a new list
    setFavoriteName(""); //clear favourite name
    setShowAddModal(true);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    // Initial fetch of favorites if not already loaded
    if (favorites.length === 0) {
      fetchFavorites();
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    // No need to clear selectedUsers here, as it's managed by the modal's state
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFavorite(null); // Clear selection
  };
  const handleSearchUsers = async (searchTerm) => {
    try {
      // Replace this with your actual API call to search users
      const response = await axios.get(`/api/users/search?q=${searchTerm}`, {
        withCredentials: true,
      });
      setSearchResults(response.data.value); // Update this based on your API response.
    } catch (err) {
      console.error("Error searching users", err);
      dispatch(showErrorToast("Failed to fetch users."));
    }
  };

  useEffect(() => {
    if (searchTerm) {
      handleSearchUsers(searchTerm);
    }
  }, [searchTerm]);

  const handleSelectUser = (user) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await getAllFavorites();
      setFavorites(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load favorites.");
      dispatch(
        showErrorToast(
          err.response?.data?.message || "Failed to load favorites."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFavorite = async () => {
    if (!favoriteName.trim()) {
      dispatch(showErrorToast("Please enter a name for the favorite list."));
      return;
    }

    if (attendees.length === 0) {
      dispatch(showErrorToast("Please select users for the favorite list."));
      return;
    }
    try {
      const favoriteData = {
        name: favoriteName,
        attendees: attendees,
      };

      const response = await createFavourite(favoriteData);
      setFavorites([...favorites, response.data]); // Update local state
      setShowAddModal(false);
      setFavoriteName("");
      setSelectedUsers([]);
      dispatch(showSuccessToast("Favorite created successfully!"));
    } catch (error) {
      console.error("Error creating favorite:", error);
      dispatch(
        showErrorToast(
          error.response?.data?.message || "Failed to create favourite."
        )
      );
    }
  };

  const handleUpdateFavorite = async () => {
    if (!favoriteName.trim()) {
      dispatch(showErrorToast("Please enter a name for the favorite list."));
      return;
    }
    if (selectedUsers.length === 0) {
      dispatch(showErrorToast("Please select users for the favorite list."));
      return;
    }

    try {
      const updatedFavoriteData = {
        name: favoriteName,
        attendees: selectedUsers,
      };
      const response = await updateFavourite(
        selectedFavorite._id,
        updatedFavoriteData
      );
      // Update local state: replace the old favorite with the updated one
      setFavorites(
        favorites.map((fav) =>
          fav._id === selectedFavorite._id ? response.data : fav
        )
      );
      setShowEditModal(false); // Close modal
      setSelectedFavorite(null); // Clear selection
      dispatch(showSuccessToast("Favorite updated successfully"));
    } catch (error) {
      console.error("Error updating favorite:", error);
      dispatch(
        showErrorToast(
          error.response?.data?.message || "Failed to update favourite."
        )
      );
    }
  };

  const handleDeleteFavorite = async (favoriteId) => {
    try {
      await deleteFavourite(favoriteId);
      setFavorites(favorites.filter((fav) => fav._id !== favoriteId));
      setSelectedFavorite(null); // Clear selection if the deleted one was selected
      setOpenDeleteDialog(false); // Close confirmation
      dispatch(showSuccessToast("Favorite deleted successfully!"));
    } catch (error) {
      console.error("Error deleting favorite:", error);
      dispatch(
        showErrorToast(
          error.response?.data?.message || "Failed to delete favourite."
        )
      );
    }
  };
  const handleOpenDeleteDialog = (favorite) => {
    setSelectedFavorite(favorite); // Set *before* opening
    setOpenDeleteDialog(true);
  };
  const handleConfirmDelete = () => {
    handleDeleteFavorite(selectedFavorite._id);
  };

  const handleSelectFavoriteForEdit = (favorite) => {
    setSelectedFavorite(favorite);
    setFavoriteName(favorite.name); // Pre-fill name
    setSelectedUsers(favorite.attendees); // Pre-fill selected users. VERY IMPORTANT
    setShowEditModal(true); // Open the Edit Modal
  };
  // / Example dimensions - adjust as needed
  const listHeight = "300px"; // e.g., fixed height
  const listWidth = "100%"; // e.g., take full width of its container

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        variant="subtitle1"
        gutterBottom
        component="div"
        sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}
      >
        Manage Favorites Attendees
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleAddClick}
          sx={{ mr: 2 }}
          disabled={attendees.length === 0} // Disable if no users are selected
        >
          <StarBorderIcon />
        </Fab>
        {/* commenting below functionality for now */}
        {/* <Fab color="secondary" aria-label="edit" onClick={handleEditClick}>
          <EditIcon />
        </Fab> */}
        {!loading && !error && (
          <List
            sx={{
              minWidth: 350,
              width: listWidth, // Set the desired width
              height: listHeight, // Set the desired height
              overflowY: "auto", // ALWAYS show vertical scrollbar
              // overflowY: 'auto', // Show scrollbar ONLY when content overflows (alternative)
              // Optional: Add borders or background for better visual separation
              border: "1px solid",
              borderColor: "divider", // Use theme's divider color
              borderRadius: 1, // Slight rounding of corners
              bgcolor: "background.paper", // Use theme's paper background color
            }}
          >
            {favorites.map(
              (
                favorite,
                index // Added index for divider check
              ) => (
                <React.Fragment key={favorite._id}>
                  {" "}
                  {/* Use Fragment for key */}
                  <ListItem
                    // Remove button prop if the main item shouldn't be clickable,
                    // or keep it if you want hover/focus styles.
                    // You could wrap ListItemText in ListItemButton if you want text clickable.
                    // button
                    // onClick={() => handleSelectFavoriteForEdit(favorite)} // Removed redundant main click

                    // Use the secondaryAction prop
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        {" "}
                        {/* Use Stack for horizontal layout and spacing */}
                        <IconButton
                          edge="end" // Helps with alignment consistency
                          aria-label={`Select users from ${favorite.name}`} // More descriptive label
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent potential ListItem click if it exists
                            oSelectedAttendees(favorite.attendees); // Use the corrected prop name
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label={`Edit ${favorite.name}`} // More descriptive label
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent potential ListItem click
                            handleSelectFavoriteForEdit(favorite);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Stack>
                    }
                  >
                    {/* Primary text content */}
                    <ListItemText
                      primary={favorite.name}
                      secondary={`${favorite.attendees.length} users`}
                      // If you want the text itself to be clickable for edit:
                      // onClick={() => handleSelectFavoriteForEdit(favorite)}
                      // sx={{ cursor: 'pointer' }} // Add pointer cursor if text is clickable
                      // Apply SX prop for truncation styles
                      sx={{
                        "& .MuiListItemText-primary": {
                          // Target the inner primary text element
                          overflow: "hidden", // Hide the overflowing text
                          textOverflow: "ellipsis", // Add ellipsis (...)
                          whiteSpace: "nowrap", // Keep the text on a single line
                          display: "block", // Ensure it behaves like a block for overflow
                        },
                      }}
                    />
                  </ListItem>
                  {/* Add Divider manually if needed between items */}
                  {index < favorites.length - 1 && <Divider component="li" />}
                </React.Fragment>
              )
            )}
          </List>
        )}
      </Box>

      {/* Add Favorite Modal */}
      <Modal open={showAddModal} onClose={handleCloseAddModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add New Favorite List
          </Typography>
          <TextField
            label="Favorite List Name"
            variant="outlined"
            fullWidth
            value={favoriteName}
            onChange={(e) => setFavoriteName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {/* <SearchUser
          // onSelectUser={handleSelectUser}
          // selectedUsers={selectedUsers}
          /> */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseAddModal}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateFavorite}
              disabled={attendees.length === 0} // Disable if no users are selected
            >
              Create
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Favorite Modal */}
      <Modal open={showEditModal} onClose={handleCloseEditModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600 }, // Responsive width
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {selectedFavorite
              ? `Edit ${selectedFavorite.name}`
              : "Edit Favorite"}
          </Typography>

          <TextField
            label="Favorite List Name"
            variant="outlined"
            fullWidth
            value={favoriteName}
            onChange={(e) => setFavoriteName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {/* Display currently selected users */}
          {selectedFavorite && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Selected Users:</Typography>
              <List>
                {selectedUsers.map((user) => (
                  <ListItem key={user.id}>
                    <ListItemText
                      primary={user.displayName}
                      secondary={user.email}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <PersonRemoveIcon color="error" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* <UserSearch
            onSelectUser={handleSelectUser}
            selectedUsers={selectedUsers}
          /> */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              color="secondary"
              onClick={handleCloseEditModal}
            >
              Cancel
            </Button>
            {selectedFavorite && (
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => handleOpenDeleteDialog(selectedFavorite)}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              endIcon={<SaveIcon />}
              color="primary"
              onClick={handleUpdateFavorite}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirmation Dialog (for delete) */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the favorite list "
            {selectedFavorite?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Display Favorites */}
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}

export default Favorites;
