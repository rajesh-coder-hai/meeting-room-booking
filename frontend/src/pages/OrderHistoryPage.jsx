// src/pages/OrderHistoryPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Box,
  Grid, // Added Grid for better layout in summary
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"; // Icon for orders
import { getMyOrderHistory } from "../api/api";
// import { getMyOrderHistory } from "../services/api"; // Import API function

// Helper function to format date/time nicely
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    // Using current date based on context provided earlier
    // For production, consider a robust date library like date-fns or moment
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // Use relevant timezone
    };
    return new Date(isoString).toLocaleString("en-IN", options);
  } catch (e) {
    console.error("Error formatting date:", e);
    return isoString; // fallback to ISO string
  }
};

// Helper function to format options
const formatOptions = (options) => {
  if (!options || Object.keys(options).length === 0) return "";
  return Object.entries(options)
    .filter(([key, value]) => value) // Only show options that have a value
    .map(
      ([key, value]) =>
        `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value?.replace(
          "_",
          " "
        )}`
    )
    .join(", ");
};

// Helper function to get status chip color
const getStatusChipColor = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "success";
    case "confirmed":
    case "preparing":
      return "info";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyOrderHistory();
        setOrders(response.data || []);
      } catch (err) {
        console.error("Error fetching order history:", err);
        setError(
          err.response?.data?.message || "Failed to load order history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array means run once on mount

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        <ReceiptLongIcon sx={{ verticalAlign: "middle", mr: 1 }} /> My Order
        History
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 5 }}>
          You haven't placed any orders yet.
        </Typography>
      ) : (
        <Box>
          {orders.map((order) => (
            <Accordion key={order._id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`order-${order._id}-content`}
                id={`order-${order._id}-header`}
              >
                {/* Using Grid for better alignment and spacing in summary */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      Order ID: ...{order._id.slice(-6)}{" "}
                      {/* Show last 6 chars */}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(order.orderTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2} sx={{ textAlign: { sm: "center" } }}>
                    <Chip
                      label={order.status?.toUpperCase()}
                      color={getStatusChipColor(order.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ textAlign: { sm: "right" } }}>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      Total: ₹{order.totalPrice.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails
                sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Delivery To:{" "}
                  {order.deliveryLocationType === "meeting_room"
                    ? `Meeting Room (${order.deliveryLocationDetails})`
                    : "Canteen"}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Items:
                </Typography>
                <List dense disablePadding>
                  {order.items.map((item, index) => (
                    <React.Fragment key={`${order._id}-item-${index}`}>
                      <ListItem>
                        <ListItemText
                          primary={`${item.quantity} x ${
                            item.menuItem?.name || "Item N/A"
                          }`}
                          secondary={
                            <>
                              Price: ₹{item.priceAtOrderTime?.toFixed(2)} each
                              {formatOptions(item.selectedOptions) &&
                                ` (${formatOptions(item.selectedOptions)})`}
                            </>
                          }
                        />
                      </ListItem>
                      {index < order.items.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default OrderHistoryPage;
