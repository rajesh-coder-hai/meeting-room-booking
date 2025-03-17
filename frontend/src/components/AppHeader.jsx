import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { Link } from "react-router-dom";

export default function AppHeader({ user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Handle menu open/close
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Extract user initials (e.g., "John Doe" → "JD")
  const getUserInitials = (name) => {
    if (!name) return "?";
    const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase();
    return initials;
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        {/* Navigation Link */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: "white", textDecoration: "none", marginRight: "4px" }}
        >
          Home
        </Typography>

        <Typography
          variant="h6"
          component={Link}
          to="/rooms"
          sx={{ color: "white", textDecoration: "none", marginRight: "4px" }}
        >
          Rooms
        </Typography>

        {/* Avatar & Dropdown Menu */}
        <IconButton onClick={handleMenuOpen}>
          <Avatar sx={{ bgcolor: "white", color: "#1976d2" }}>
            {getUserInitials(user?.name)}
          </Avatar>
        </IconButton>

        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <hr style={{ width: "100%", margin: "4px 0", border: "none", borderTop: "1px solid #ccc" }} />
          <MenuItem onClick={onLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
