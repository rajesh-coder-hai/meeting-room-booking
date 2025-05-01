import React, { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

// MUI Imports
import {
  AppBar,
  Badge, // <-- Import Badge
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// MUI Icons
import AppsIcon from "@mui/icons-material/Apps";
import LogoutIcon from "@mui/icons-material/Logout";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MenuIcon from "@mui/icons-material/Menu";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // <-- Import Cart Icon
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { useSelector } from "react-redux";
import { useColorMode } from "../muiTheme/ThemeContext";
import CartView from "./cart/CartView";

// Change the function signature to destructure props
function CartIconWithBadge({ items }) {
  // <-- Correctly destructure items from props
  const [cartOpen, setCartOpen] = useState(false);

  // console.log("--- CartIconWithBadge ---");
  // console.log("Items received via props:", items); // Log prop value

  const handleCartToggle = () => {
    setCartOpen(!cartOpen);
  };

  // Calculate itemCount using the items prop
  // Add a check in case items is unexpectedly not an array
  const itemCount = Array.isArray(items)
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <>
      <Tooltip title="View Cart">
        <IconButton
          color="inherit"
          onClick={handleCartToggle}
          aria-label="open shopping cart"
        >
          {/* Use itemCount directly, default 0 handled above */}
          <Badge badgeContent={itemCount} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <CartView open={cartOpen} onClose={handleCartToggle} />
    </>
  );
}

const Navbar = () => {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // <-- Use the hook
  const cartItems = useSelector((state) => state?.cart?.items || []);

  console.log("--- Navbar ---");
  console.log("Cart items from Redux state:", cartItems);

  // --- Login State Logic (Keep as is) ---
  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem("token"); // Use your actual token key
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [checkLoginStatus]);
  // --- End Login State Logic ---

  // --- Handlers (Keep as is) ---
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleLogin = () => {
    const microsoftAuthUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/auth/microsoft`;
    window.location.href = microsoftAuthUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Use your actual token key
    sessionStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`;
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
        {/* Add Menu Link if needed */}
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/menu">
            {" "}
            {/* Link to Menu Page */}
            <ListItemIcon>
              {/* Choose an appropriate icon like RestaurantMenuIcon or CoffeeIcon */}
              <AppsIcon /> {/* Placeholder icon */}
            </ListItemIcon>
            <ListItemText primary="Order Food/Drinks" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/rooms">
            <ListItemIcon>
              <AppsIcon />
            </ListItemIcon>
            <ListItemText primary="Rooms" />
          </ListItemButton>
        </ListItem>
        {/* Add Order History Link if needed */}
        {isLoggedIn && ( // Only show if logged in
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/order-history">
              {" "}
              {/* Link to Order History */}
              <ListItemIcon>
                {/* Choose an appropriate icon like HistoryIcon or ReceiptIcon */}
                <AppsIcon /> {/* Placeholder icon */}
              </ListItemIcon>
              <ListItemText primary="My Orders" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
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
                <MicrosoftIcon />
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
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* App Title/Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              // flexGrow: 1, // Adjusted below
              display: "flex",
              alignItems: "center",
              color: "inherit",
              textDecoration: "none",
              fontWeight: "bold",
              letterSpacing: ".05rem",
              mr: 2,
            }}
          >
            <MeetingRoomIcon sx={{ mr: 1 }} />
            RoomSync
          </Typography>

          {/* Spacer to push items to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation Items & Icons */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Theme toggle icon - Moved here for better grouping on desktop */}
            <Tooltip
              title={`Switch to ${
                theme.palette.mode === "light" ? "Dark" : "Light"
              } Mode`}
            >
              <IconButton
                sx={{ ml: 1 }}
                onClick={toggleColorMode}
                color="inherit"
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>

            {/* Menu Link */}
            <Button
              color="inherit"
              component={RouterLink}
              to="/menu"
              // Add an icon if desired
            >
              Menu
            </Button>

            <Button
              color="inherit"
              component={RouterLink}
              to="/rooms"
              startIcon={<AppsIcon />}
            >
              Rooms
            </Button>

            {/* Order History Link */}
            {isLoggedIn && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/order-history"
                // Add an icon if desired
              >
                My Orders
              </Button>
            )}

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
                startIcon={<MicrosoftIcon />}
              >
                Login with Microsoft
              </Button>
            )}

            {/* Conditionally render Cart Icon only if logged in */}
            {isLoggedIn && <CartIconWithBadge items={cartItems} />}
          </Box>

          {/* Mobile View Icons (Theme Toggle and Cart might fit here too) */}
          <Box
            sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}
          >
            {/* Theme toggle icon for mobile */}
            <Tooltip
              title={`Switch to ${
                theme.palette.mode === "light" ? "Dark" : "Light"
              } Mode`}
            >
              <IconButton
                sx={{ ml: 1 }}
                onClick={toggleColorMode}
                color="inherit"
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>

            {/* Conditionally render Cart Icon only if logged in for mobile */}
            {isLoggedIn && <CartIconWithBadge />}
          </Box>
        </Toolbar>
      </Container>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
