// src/pages/MenuPage.js (or similar path)
import React, { useState, useEffect, useContext } from "react"; // Added useContext
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip, // Added Chip for category/price display
} from "@mui/material";
import { motion } from "framer-motion";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
// import { fetchMenuItemsUser } from "../services/api"; // Import API function
// import { useCart } from "../context/CartContext";
import { fetchMenuItemsUser } from "../api/api";
import { useDispatch } from "react-redux";
import { addItem } from "../store/slices/cartSlice";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function MenuPage() {
  const dispatch = useDispatch();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const { addItem } = useCart(); // Get addItem function from context
  // State to manage selected sweetness for each item temporarily
  const [selectedOptions, setSelectedOptions] = useState({}); // { itemId: { sweetness: '...' } }

  // Get cart functions from context (to be implemented)
  // const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchMenuItemsUser();
        setMenuItems(response.data || []);
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load menu items. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const handleOptionChange = (itemId, optionType, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [optionType]: value,
      },
    }));
  };

  const handleAddToCart = (item) => {
    console.log("--- handleAddToCart ---");
    console.log("Item clicked:", item);

    const options = selectedOptions[item._id] || {};
    console.log("Selected options:", options);

    if (item.customizableOptions?.sweetness && !options.sweetness) {
      console.log("Validation failed: Sweetness required but not selected.");
      alert(`Please select a sweetness level for ${item.name}.`);
      return;
    }

    // Prepare payload expected by the addItem reducer
    const payload = {
      item: {
        // Send necessary item details
        id: item._id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        // Avoid sending the whole complex item object if not needed by reducer/cart state
      },
      quantity: 1,
      options: options,
    };
    console.log("Dispatching addItem with payload:", payload);

    dispatch(addItem(payload)); // <-- Dispatch the action

    // Optional: Dispatch a toast notification using your shared slice
    // dispatch(showSuccessToast(`${item.name} added to cart!`));
  };

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
        Menu
      </Typography>
      <Grid container spacing={4}>
        {menuItems.map((item, index) => (
          <Grid item key={item._id} xs={12} sm={6} md={4}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }} // Example hover animation
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={
                    item.imageUrl || item.name.toLowerCase().startsWith("black")
                      ? "/blacCoffee.png"
                      : item.name.toLowerCase().startsWith("cold")
                      ? "/coldCoffee.png"
                      : item.name.toLowerCase().startsWith("hot")
                      ? "/milkCoffee.png"
                      : "/latte.png"
                  } // Use a placeholder if no image
                  alt={item.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {item.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Chip label={item.category} size="small" />
                    <Typography variant="h6" component="p" color="primary">
                      ₹{item.price}
                    </Typography>
                  </Box>

                  {/* Sweetness Customization */}
                  {item.customizableOptions?.sweetness && (
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel id={`sweetness-label-${item._id}`}>
                        Sweetness
                      </InputLabel>
                      <Select
                        labelId={`sweetness-label-${item._id}`}
                        id={`sweetness-select-${item._id}`}
                        value={selectedOptions[item._id]?.sweetness || ""}
                        label="Sweetness"
                        onChange={(e) =>
                          handleOptionChange(
                            item._id,
                            "sweetness",
                            e.target.value
                          )
                        }
                      >
                        <MenuItem value={"no_sugar"}>No Sugar</MenuItem>
                        <MenuItem value={"low_sweet"}>Low Sweet</MenuItem>
                        <MenuItem value={"normal_sweet"}>Normal Sweet</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  {/* Add other customization options similarly */}
                </CardContent>
                <CardActions sx={{ justifyContent: "center", p: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => handleAddToCart(item)}
                    fullWidth
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      {menuItems.length === 0 && !loading && (
        <Typography align="center" sx={{ mt: 4 }}>
          No menu items available at the moment.
        </Typography>
      )}
    </Container>
  );
}

export default MenuPage;
