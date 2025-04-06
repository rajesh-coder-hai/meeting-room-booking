// src/components/ProductFeatures.jsx
import React from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper, // Use Paper for subtle background/elevation
  Avatar, // To nicely frame icons
} from "@mui/material";

// Import relevant MUI Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DuoIcon from "@mui/icons-material/Duo"; // Represents Video/Teams
import EmailIcon from "@mui/icons-material/Email"; // Represents Outlook Email
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import DevicesIcon from "@mui/icons-material/Devices"; // Represents responsiveness

// Define features and benefits data
const features = [
  {
    icon: <CalendarMonthIcon fontSize="large" color="primary" />,
    title: "Effortless Room Scheduling",
    description:
      "Visually browse room availability with an interactive calendar. Instantly see free slots and avoid booking conflicts.",
  },
  {
    icon: <FilterAltIcon fontSize="large" color="primary" />,
    title: "Find the Perfect Space",
    description:
      "Quickly filter and search rooms based on capacity, floor, and essential amenities like projectors, TVs, or whiteboards.",
  },
  {
    icon: <GroupAddIcon fontSize="large" color="primary" />,
    title: "Seamless Attendee Invites",
    description:
      "Search and add colleagues directly from your organization's directory using integrated Microsoft Graph search.",
  },
  {
    icon: <EmailIcon fontSize="large" color="primary" />,
    title: "Integrated Outlook Calendar",
    description:
      "Bookings automatically create calendar events and send invites directly to attendees' Outlook calendars. Updates and cancellations sync effortlessly.",
  },
  {
    icon: <DuoIcon fontSize="large" color="primary" />,
    title: "Automatic Teams Meetings",
    description:
      "Optionally generate Microsoft Teams meeting links automatically for every booking, included directly in the calendar invite.",
  },
  {
    icon: <FavoriteIcon fontSize="large" color="primary" />,
    title: "Favorite Attendee Lists",
    description:
      "Create and save frequently used groups of attendees ('Favorites') for quick selection when booking recurring meetings.",
  },
  {
    icon: <SettingsSuggestIcon fontSize="large" color="primary" />,
    title: "Easy Room Management (Admin)",
    description:
      "Admins have full control to add, edit, or remove rooms and manage their details and availability settings.",
  },
  {
    icon: <DevicesIcon fontSize="large" color="primary" />,
    title: "Modern & Responsive UI",
    description:
      "Enjoy a clean, intuitive interface built with modern technology that works seamlessly across desktop and mobile devices.",
  },
];

const ProductFeatures = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {" "}
      {/* Add vertical padding */}
      <Typography
        variant="h3"
        component="h2"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 6 }} // Add margin bottom
      >
        Streamline Your Meeting Room Bookings
      </Typography>
      <Typography
        variant="h6"
        align="center"
        color="text.secondary"
        paragraph
        sx={{ mb: 8 }} // Add more margin bottom
      >
        Stop wasting time searching for available rooms and coordinating
        invites. Our integrated platform makes booking the right space and
        inviting your team effortless.
      </Typography>
      <Grid container spacing={4}>
        {" "}
        {/* Increased spacing */}
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              variant="outlined" // Subtle outline
              sx={{
                p: 3, // Padding inside the paper
                textAlign: "center",
                height: "100%", // Make papers in a row equal height
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                // Optional hover effect:
                // '&:hover': {
                //     boxShadow: 3,
                // }
              }}
            >
              <Avatar
                sx={{ bgcolor: "primary.light", width: 56, height: 56, mb: 2 }}
              >
                {feature.icon}
              </Avatar>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{ fontWeight: "medium" }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ flexGrow: 1 }}
              >
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {/* Optional Call to Action Button */}
      {/* <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Button variant="contained" size="large">
                    Get Started Now
                </Button>
            </Box> */}
    </Container>
  );
};

export default ProductFeatures;
