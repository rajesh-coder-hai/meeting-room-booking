// src/components/Cart/CartView.js
import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Divider,
  Button,
  TextField,
  Stack, // For layout
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Alert,
  Select,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { motion, AnimatePresence } from "framer-motion"; // For item animations
import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  removeItem,
  updateItemQuantity,
} from "../../store/slices/cartSlice";
import { fetchRooms, placeOrder } from "../../api/api";
import {
  showErrorToast,
  showSuccessToast,
} from "../../store/slices/sharedSlice";
import { useNavigate } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import { getFloorName } from "../../helper";

// Simple function to format options for display
const formatOptions = (options) => {
  if (!options || Object.keys(options).length === 0) return null;
  return Object.entries(options)
    .map(
      ([key, value]) =>
        `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value?.replace(
          "_",
          " "
        )}`
    )
    .join(", ");
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
};

function CartView({ open, onClose }) {
  const dispatch = useDispatch(); // <-- Get dispatch
  const navigate = useNavigate(); // <-- Get navigate function

  const [meetingRooms, setMeetingRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [errorRooms, setErrorRooms] = useState(null);
  const [deliveryLocationType, setDeliveryLocationType] = useState(""); // 'canteen' or 'meeting_room'
  const [deliveryLocationDetails, setDeliveryLocationDetails] = useState(""); // 'Canteen' or room._id
  const [placingOrder, setPlacingOrder] = useState(false); // Loading state for order placement

  // Fetch meeting rooms when the drawer opens (if not already fetched)
  useEffect(() => {
    const loadMeetingRooms = async () => {
      // Only fetch if type is meeting room and list is empty
      if (
        deliveryLocationType === "meeting_room" &&
        meetingRooms.length === 0 &&
        !loadingRooms
      ) {
        console.log("Fetching meeting rooms...");
        setLoadingRooms(true);
        setErrorRooms(null);
        try {
          const { data: rooms } = await fetchRooms();
          console.log("Meeting rooms fetched:", rooms);

          setMeetingRooms(rooms || []);
        } catch (err) {
          console.error("Error fetching meeting rooms:", err);
          setErrorRooms(
            err.response?.data?.message || "Failed to load meeting rooms."
          );
        } finally {
          setLoadingRooms(false);
        }
      }
    };

    if (open) {
      // Fetch only when drawer is open
      loadMeetingRooms();
    }
    // Dependency array includes 'open' and 'deliveryLocationType' to refetch if needed
  }, [open, deliveryLocationType, meetingRooms.length, loadingRooms]);

  // Select state from Redux store
  const fullState = useSelector((state) => state);
  console.log("Redux Full State in CartView:", fullState); // Check this log output

  // Then safely access the cart state
  const cartState = fullState?.cart; // Access cart potentially undefined
  const items = cartState?.items || []; // Default to empty array if cartState or items is undefined
  const totalAmount = cartState?.totalAmount || 0; // Default to 0

  const handleQuantityChange = (id, options, event) => {
    // Pass options to identify item
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      dispatch(updateItemQuantity({ id, quantity: newQuantity, options })); // <-- Dispatch action
    }
  };

  const handleQuantityBlur = (id, options, event) => {
    // Pass options
    const newQuantity = parseInt(event.target.value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      dispatch(updateItemQuantity({ id, quantity: 1, options })); // <-- Dispatch action (reset to 1)
    }
  };

  // --- Handle Location Type Change ---
  const handleLocationTypeChange = (event) => {
    const newType = event.target.value;
    setDeliveryLocationType(newType);
    // Reset specific location details when type changes
    if (newType === "canteen") {
      setDeliveryLocationDetails("Canteen");
      setErrorRooms(null); // Clear room errors if switching to canteen
    } else {
      setDeliveryLocationDetails(""); // Clear details when switching to meeting room
    }
  };

  const handleRemoveItem = (id, options) => {
    // Pass options
    dispatch(removeItem({ id, options })); // <-- Dispatch action
  };

  const handleCheckout = () => {
    console.log("Proceeding to checkout...");
    // Add navigation logic here
    onClose();
  };

  // ... inside CartView component ...

  const handlePlaceOrder = async () => {
    // Basic validation check (should be covered by button disabled state, but good practice)
    if (
      items.length === 0 ||
      !deliveryLocationType ||
      !deliveryLocationDetails
    ) {
      dispatch(
        showErrorToast("Please fill cart and select delivery location.")
      );
      return;
    }

    setPlacingOrder(true); // Set loading state

    // Map cart items to the format expected by the backend API
    const orderData = {
      cartItems: items.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        selectedOptions: item.options,
      })),
      deliveryInfo: {
        deliveryLocationType: deliveryLocationType,
        deliveryLocationDetails: deliveryLocationDetails,
      },
    };

    console.log("Placing order with data:", orderData);

    try {
      const response = await placeOrder(orderData); // Call API service function
      console.log("Order placed successfully:", response.data);

      dispatch(showSuccessToast("Order placed successfully!")); // Show success feedback
      dispatch(clearCart()); // Clear the cart from Redux state
      onClose(); // Close the cart drawer
      setDeliveryLocationType(""); // Reset local state
      setDeliveryLocationDetails("");
      // Optional: Navigate to order history or a confirmation page
      navigate("/order-history"); // Navigate to order history page (ensure this route exists)
    } catch (err) {
      console.error("Error placing order:", err);
      // Use the error message from the backend response if available
      const errorMessage =
        err.response?.data?.message ||
        "Failed to place order. Please try again.";
      dispatch(showErrorToast(errorMessage)); // Show error feedback
    } finally {
      setPlacingOrder(false); // Reset loading state
    }
  };

  // ... rest of component ...

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 350,
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
        role="presentation"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="div">
            Your Cart
          </Typography>
          <IconButton onClick={onClose} aria-label="close cart">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {items.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ mt: 4 }}>
            Your cart is empty.
          </Typography>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflowY: "auto" }}>
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id + JSON.stringify(item.options)} // Unique key for items+options
                    layout
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <ListItem
                      secondaryAction={
                        <Tooltip title="Remove item">
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() =>
                              handleRemoveItem(item.id, item.options)
                            }
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      }
                      sx={{ pr: 8 }} // Add padding to prevent overlap with delete button
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="square"
                          src={item.imageUrl || "/placeholder-image.jpg"}
                          alt={item.name}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              ₹{item.price} each
                            </Typography>
                            {formatOptions(item.options) && (
                              <Typography
                                component="span"
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                {formatOptions(item.options)}
                              </Typography>
                            )}
                            <TextField
                              type="number"
                              size="small"
                              variant="outlined"
                              label="Qty"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.id, item.options, e)
                              }
                              onBlur={(e) =>
                                handleQuantityBlur(item.id, item.options, e)
                              }
                              inputProps={{
                                min: 1,
                                style: {
                                  maxWidth: "50px",
                                  textAlign: "center",
                                },
                              }}
                              sx={{ mt: 1, maxWidth: "70px" }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
            Total: ₹{totalAmount}
            <Divider sx={{ my: 2 }} />
            {/* --- Location Selection --- */}
            <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
              Delivery Location
            </Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="location-type-label">Deliver To</InputLabel>
              <Select
                labelId="location-type-label"
                value={deliveryLocationType}
                label="Deliver To"
                onChange={handleLocationTypeChange}
                disabled={placingOrder}
              >
                <MenuItem value={"canteen"}>Canteen</MenuItem>
                <MenuItem value={"meeting_room"}>Meeting Room</MenuItem>
              </Select>
            </FormControl>
            {/* Conditionally show Meeting Room selector */}
            {deliveryLocationType === "meeting_room" && (
              <FormControl
                fullWidth
                margin="normal"
                required
                disabled={loadingRooms || placingOrder}
              >
                <InputLabel id="meeting-room-label">Select Room</InputLabel>
                <Select
                  labelId="meeting-room-label"
                  value={deliveryLocationDetails}
                  label="Select Room"
                  onChange={(e) => setDeliveryLocationDetails(e.target.value)}
                >
                  {loadingRooms && (
                    <MenuItem disabled value="">
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Loading
                      Rooms...
                    </MenuItem>
                  )}
                  {!loadingRooms && meetingRooms.length === 0 && (
                    <MenuItem disabled value="">
                      No rooms available
                    </MenuItem>
                  )}
                  {!loadingRooms &&
                    meetingRooms.map((room) => (
                      <MenuItem
                        key={room._id}
                        value={`${room.roomName} - ${getFloorName(
                          room.floorNo
                        )}`}
                      >
                        {`${room.roomName} - ${getFloorName(room.floorNo)}`}
                      </MenuItem>
                    ))}
                </Select>
                {errorRooms && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {errorRooms}
                  </Alert>
                )}
              </FormControl>
            )}
            {/* --- End Location Selection --- */}
            <Box sx={{ mt: "auto", p: 1 }}>
              {/* ... (Total amount Typography) ... */}
              {/* Update the button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={
                  placingOrder ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                onClick={handlePlaceOrder} // <-- Changed handler
                disabled={
                  items.length === 0 ||
                  !deliveryLocationType ||
                  !deliveryLocationDetails || // Details must be selected ('Canteen' or a room ID)
                  placingOrder || // Disable while placing order
                  (deliveryLocationType === "meeting_room" && loadingRooms) // Disable if rooms are loading
                }
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default CartView;
