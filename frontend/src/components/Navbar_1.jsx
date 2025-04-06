import React, { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom"; // Use RouterLink for navigation

// MUI Imports
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider, // Optional: to constrain width
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";

// MUI Icons
import AppsIcon from "@mui/icons-material/Apps"; // Rooms Icon
import LogoutIcon from "@mui/icons-material/Logout";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom"; // App Icon
import MenuIcon from "@mui/icons-material/Menu";
import MicrosoftIcon from "@mui/icons-material/Microsoft"; // Official MUI icon
import { useDispatch } from "react-redux";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Assuming you might need dispatch later for state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // const theme = useTheme();
  const isMobile = false;
  //useMediaQuery(theme.breakpoints.down("md")); // Breakpoint for mobile menu

  // --- Login State Logic (Keep as is for now, but recommend moving to global state) ---
  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem("token");
    // Basic check, real app would validate token
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    checkLoginStatus();
    // Optional: Add event listener for storage changes to auto-update UI
    window.addEventListener("storage", checkLoginStatus);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [checkLoginStatus]);
  // --- End Login State Logic ---

  // --- Handlers ---
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleLogin = () => {
    const microsoftAuthUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/auth/microsoft`;
    // Optionally add redirect query param if backend supports it
    // const redirectUrl = `${window.location.origin}/rooms`;
    // microsoftAuthUrl += `?redirect=${encodeURIComponent(redirectUrl)}`;
    window.location.href = microsoftAuthUrl;
  };

  const handleLogout = () => {
    // 1. Clear Client-Side Storage
    localStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken"); // Clear session storage too

    // 2. Update Local State Immediately (for instant UI feedback)
    setIsLoggedIn(false);

    // 3. Optional: Notify Backend (Good practice, even with redirects)
    // fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, { method: 'POST' })
    //   .catch(err => console.error("Backend logout error:", err));

    // 4. Redirect (or let backend handle redirect after its logout)
    // Option A: Redirect directly (if backend doesn't redirect automatically)
    // navigate('/');
    // Option B: Redirect to backend logout which then redirects back home
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`;

    // Consider dispatching a Redux logout action here if using Redux for auth state
    // dispatch(logoutUserAction());
  };
  // --- End Handlers ---

  // --- Drawer Content ---
  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: "center", width: 250 }}
      role="presentation"
    >
      <Typography variant="h6" sx={{ my: 2 }}>
        Menu
      </Typography>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/rooms">
            <ListItemIcon>
              <AppsIcon />
            </ListItemIcon>
            <ListItemText primary="Rooms" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          {/* Conditional Login/Logout in Drawer */}
          {isLoggedIn ? (
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          ) : (
            <ListItemButton onClick={handleLogin}>
              <ListItemIcon>
                <MicrosoftIcon /> {/* Or LoginIcon */}
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          )}
        </ListItem>
      </List>
    </Box>
  );
  // --- End Drawer Content ---

  return (
    <AppBar position="static">
      {" "}
      {/* Or "sticky", "fixed" */}
      {/* Use Container to constrain width, remove if you want full-width */}
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {" "}
          {/* disableGutters removes default padding */}
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }} // Show only on mobile (md breakpoint)
          >
            <MenuIcon />
          </IconButton>
          {/* App Title/Logo (Clickable to Home) */}
          <Typography
            variant="h6"
            component={RouterLink} // Make it a router link
            to="/"
            sx={{
              flexGrow: 1, // Pushes items to the right
              display: "flex", // To align icon and text
              alignItems: "center",
              color: "inherit", // Inherit color from AppBar
              textDecoration: "none", // Remove underline
              fontWeight: "bold",
              letterSpacing: ".05rem",
              mr: 2, // Margin for spacing
            }}
          >
            <MeetingRoomIcon sx={{ mr: 1 }} /> {/* App Icon */}
            RoomSync {/* Example App Name */}
          </Typography>
          {/* Desktop Navigation Items */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            {" "}
            {/* Hide on mobile */}
            <Button
              color="inherit"
              component={RouterLink}
              to="/rooms"
              startIcon={<AppsIcon />}
            >
              Rooms
            </Button>
            {/* Conditional Login/Logout Button for Desktop */}
            {isLoggedIn ? (
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                onClick={handleLogin}
                startIcon={<MicrosoftIcon />} // Use official icon
              >
                Login with Microsoft
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary" // Slides over content
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" }, // Show only on mobile
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 }, // Drawer width
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
