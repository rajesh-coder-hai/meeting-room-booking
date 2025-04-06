import React from "react"; // No longer need motion if using MUI Fade
import { useNavigate } from "react-router-dom";
import ProductFeatures from "../components/ProductFeatures"; // Assuming this uses MUI

// MUI Imports
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Fade, // MUI Transition component
} from "@mui/material";

// Optional: If you want a specific icon instead of img for MS logo
// import MicrosoftIcon from '@mui/icons-material/Microsoft'; // Example

export default function LandingPage() {
  const navigate = useNavigate();

  const handleMicrosoftLogin = () => {
    // Construct the URL for Microsoft login
    // Ensure your VITE_API_BASE_URL is correctly set in your .env file
    const microsoftAuthUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/auth/microsoft`;
    window.location.href = microsoftAuthUrl; // Redirect the current window
  };

  return (
    // Use React.Fragment or just Box if no other top-level elements needed
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative", // Needed for overlay positioning
          minHeight: "90vh", // Use minHeight, allows content below. Adjust as needed (e.g., '100vh', '700px')
          width: "100%",
          backgroundImage: "url(/landingPage1.webp)", // Assumes image is in /public
          backgroundSize: "cover",
          backgroundPosition: "center center",
          display: "flex", // Use flexbox to center overlay content
          alignItems: "center",
          justifyContent: "center",
          color: "common.white", // Default text color for this section
          textAlign: "center",
        }}
      >
        {/* Dark Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)", // Dark overlay - adjust opacity (0.65 = 65%)
            zIndex: 1, // Ensure overlay is above background
          }}
        />

        {/* Centered Content */}
        <Container
          maxWidth="md" // Limit content width for better readability
          sx={{ position: "relative", zIndex: 2, py: 4 }} // Ensure content is above overlay, add padding
        >
          <Fade in={true} timeout={1000}>
            <Typography
              variant="h2" // Use appropriate semantic heading
              component="h1" // Set the actual HTML tag
              gutterBottom // Adds margin-bottom
              sx={{
                fontWeight: "bold",
                // Responsive font size
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                mb: 2, // Margin bottom
              }}
            >
              Seamless Meeting Room Booking
            </Typography>
          </Fade>

          <Fade in={true} timeout={1500}>
            <Typography
              variant="h6" // Use h6 or body1 for subheading
              component="p" // Set the actual HTML tag
              sx={{ mb: 4, fontWeight: 300, maxWidth: "700px", mx: "auto" }} // Limit width, center margin
            >
              Find available rooms instantly, check amenities, and send Outlook
              & Teams invites effortlessly. Streamline your scheduling.
            </Typography>
          </Fade>

          <Fade in={true} timeout={2000}>
            <Stack
              direction={{ xs: "column", sm: "row" }} // Stack vertically on small screens, row on others
              spacing={2} // Spacing between buttons
              justifyContent="center" // Center buttons horizontally
            >
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={() => navigate("/rooms")} // Navigate to rooms page
                sx={{ px: 4, py: 1.5 }}
              >
                Find a Room
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleMicrosoftLogin}
                sx={{
                  px: 4,
                  py: 1.5,
                  color: "common.white", // White text
                  borderColor: "rgba(255, 255, 255, 0.5)", // Lighter border
                  "&:hover": {
                    borderColor: "common.white", // Solid white border on hover
                    bgcolor: "rgba(255, 255, 255, 0.1)", // Slight background tint on hover
                  },
                }}
                startIcon={
                  <img
                    src="/microsoft.svg" // Assumes image is in /public
                    alt="Microsoft Logo"
                    style={{ height: "20px", width: "20px" }} // Keep aspect ratio
                  />
                }
              >
                Login with Microsoft
              </Button>
            </Stack>
          </Fade>
        </Container>
      </Box>

      {/* Features Section - Placed *after* the hero section */}
      <Box sx={{ bgcolor: "background.paper", py: { xs: 6, md: 8 } }}>
        {" "}
        {/* Add background and padding */}
        <ProductFeatures />
      </Box>

      {/* Optional Footer Section */}
      {/* <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'common.white', py: 3, textAlign: 'center' }}>
                <Typography variant="body2">© {new Date().getFullYear()} Your Company Name</Typography>
            </Box> */}
    </>
  );
}
