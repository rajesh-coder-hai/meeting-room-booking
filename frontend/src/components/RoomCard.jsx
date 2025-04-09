import React from "react";
import { motion } from "framer-motion";

// MUI Imports
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardActionArea, // To make the main card area clickable
  Typography,
  Grid,
  Box,
  IconButton,
  Button,
  Tooltip, // Optional: for icon button hints
  Chip, // Optional: for displaying capacity/floor nicely
} from "@mui/material";

// MUI Icons (replace Font Awesome)
import GroupIcon from "@mui/icons-material/Group"; // Replacement for faUsers
import VideocamIcon from "@mui/icons-material/Videocam"; // Replacement for faProjectDiagram/faProjector
import TvIcon from "@mui/icons-material/Tv"; // Replacement for faTv
import DashboardIcon from "@mui/icons-material/Dashboard"; // Replacement for faChalkboard
import PhoneIcon from "@mui/icons-material/Phone"; // Replacement for faPhone
import EditIcon from "@mui/icons-material/Edit"; // Replacement for faEdit
import DeleteIcon from "@mui/icons-material/DeleteOutline"; // Replacement for faDeleteLeft (using outline variant)
import EventAvailableIcon from "@mui/icons-material/EventAvailable"; // Replacement for faCalendarCheck

// Helper function (keep as is)
function getFloorName(floorNumber) {
  if (floorNumber == null || floorNumber === undefined) return "";
  if (floorNumber === 0) return "Ground";
  if (floorNumber === -1) return "Lower ground";
  const n = Math.abs(floorNumber);
  const suffix = ["th", "st", "nd", "rd"][
    n % 100 > 3 && n % 100 < 21 ? 0 : n % 10 < 4 ? n % 10 : 0
  ];
  return `${n}${suffix} floor`;
}

export const RoomCard = ({ room, onClick, isAdmin, onEdit, onDelete }) => {
  // Stop propagation for button clicks inside the card action area
  const handleButtonClick = (e, callback, roomData) => {
    e.stopPropagation(); // Prevent the main card's onClick from firing
    callback(roomData);
  };

  return (
    // motion.div remains for animation. It wraps the Grid item in the parent.
    // The component itself now just returns the Card.
    // The parent RoomManager places this inside a <Grid item>.
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ height: "100%" }} // Ensure motion div takes full height for Card height: 100%
    >
      <Card
        variant="outlined" // Or elevation={2} for shadow
        sx={{
          height: "100%", // Make card fill the grid item height
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", // Pushes actions to bottom
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out", // Smooth hover effect
          "&:hover": {
            transform: "translateY(-4px)", // Slight lift on hover
            boxShadow: 3, // Increase shadow on hover (if using elevation)
          },
        }}
      >
        {/* Make the main content area clickable */}
        <CardActionArea
          onClick={() => onClick(room)}
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <CardHeader
            title={
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={1}
              >
                <Typography variant="h6" align="center">
                  {room.roomName}
                </Typography>

                {/* Status chip from meta.text */}
                {room.meta?.text && (
                  <Chip
                    label={room.meta.text}
                    size="small"
                    sx={{
                      bgcolor:
                        room.meta.text.toLowerCase() === "available"
                          ? "success.light"
                          : room.meta.text.toLowerCase() === "busy"
                          ? "error.light"
                          : "warning.light",
                      color: "common.white",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </Box>
            }
            subheader={getFloorName(room.floorNo)}
            subheaderTypographyProps={{
              variant: "body2",
              align: "center",
              color: "text.secondary",
            }}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              width: "100%",
              pt: 2,
              pb: 1,
            }}
          />

          <CardContent sx={{ flexGrow: 1, width: "100%", pt: 2 }}>
            {/* Use Grid for feature layout */}
            <Grid container spacing={1.5} alignItems="center">
              {/* Capacity */}
              <Grid
                item
                xs={6}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <GroupIcon fontSize="small" color="action" />
                <Typography variant="body2">Cap: {room.capacity}</Typography>
              </Grid>
              {/* Phone Extension */}
              <Grid
                item
                xs={6}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Ext: {room.extensionNumber || "N/A"}
                </Typography>
              </Grid>
              {/* Projector */}
              <Grid
                item
                xs={6}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <VideocamIcon
                  fontSize="small"
                  color={room.projector ? "success" : "disabled"}
                />
                <Typography
                  variant="body2"
                  color={room.projector ? "text.primary" : "text.disabled"}
                >
                  Projector
                </Typography>
              </Grid>
              {/* TV Screen */}
              <Grid
                item
                xs={6}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TvIcon
                  fontSize="small"
                  color={room.tvScreen ? "success" : "disabled"}
                />
                <Typography
                  variant="body2"
                  color={room.tvScreen ? "text.primary" : "text.disabled"}
                >
                  TV Screen
                </Typography>
              </Grid>
              {/* Whiteboard */}
              <Grid
                item
                xs={6}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <DashboardIcon
                  fontSize="small"
                  color={room.whiteboard ? "success" : "disabled"}
                />
                <Typography
                  variant="body2"
                  color={room.whiteboard ? "text.primary" : "text.disabled"}
                >
                  Whiteboard
                </Typography>
              </Grid>
              {/* Add more features if needed */}
            </Grid>
          </CardContent>
        </CardActionArea>{" "}
        {/* End Clickable Area */}
        {/* Action Buttons - Outside CardActionArea */}
        <CardActions
          sx={{
            justifyContent: "space-between",
            borderTop: 1,
            borderColor: "divider",
            px: 2,
            py: 1,
          }}
        >
          <Box>
            {" "}
            {/* Container for left-aligned admin buttons */}
            {isAdmin && (
              <>
                <Tooltip title="Edit Room">
                  <IconButton
                    size="small"
                    aria-label={`Edit ${room.roomName}`}
                    onClick={(e) => handleButtonClick(e, onEdit, room)}
                    color="secondary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Room">
                  <IconButton
                    size="small"
                    aria-label={`Delete ${room.roomName}`}
                    onClick={(e) => handleButtonClick(e, onDelete, room)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<EventAvailableIcon />}
            onClick={(e) => handleButtonClick(e, onClick, room)} // Trigger same action as card click
            sx={{ textTransform: "none" }} // Prevent uppercase text
          >
            Book Now
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};
