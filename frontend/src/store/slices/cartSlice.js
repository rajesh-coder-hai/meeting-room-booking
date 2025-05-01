// src/store/slices/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

// --- Helper Functions ---
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const saveCartToLocalStorage = (items) => {
  try {
    // Only save essential item data to avoid storing large/unnecessary fields
    const essentialItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      options: item.options,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    }));
    localStorage.setItem(
      "shoppingCartRedux",
      JSON.stringify({ items: essentialItems })
    );
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

const loadCartFromLocalStorage = () => {
  try {
    const storedCart = localStorage.getItem("shoppingCartRedux");
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      // Ensure items array exists and has valid structure maybe?
      return parsedCart.items || [];
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return []; // Return empty array if nothing found or error
};
// --- End Helper Functions ---

// --- Initial State ---
const initialItems = loadCartFromLocalStorage();
const initialState = {
  items: initialItems,
  totalAmount: calculateTotal(initialItems),
};
// --- End Initial State ---

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Action to completely set the cart (e.g., on initial load if needed differently)
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalAmount = calculateTotal(state.items);
      // No need to save to localStorage here, as loading handles initial state
    },

    // Action to add an item (or increase quantity)
    addItem: (state, action) => {
      const { item, quantity, options } = action.payload;
      // Ensure we have a valid item structure with an ID
      if (!item || !item.id) {
        console.error(
          "addItem rejected: Invalid item data received.",
          action.payload
        );
        return; // Do nothing if item data is bad
      }

      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.options) === JSON.stringify(options)
      );

      if (existingItemIndex >= 0) {
        // Item with same options exists, increase quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        state.items.push({
          id: item.id, // Already validated this exists
          name: item.name,
          price: item.price,
          options: options,
          quantity: quantity,
          imageUrl: item.imageUrl,
        });
      }
      // Recalculate total and save
      state.totalAmount = calculateTotal(state.items);
      saveCartToLocalStorage(state.items);
    },

    // Action to remove an item (identified by ID and options)
    removeItem: (state, action) => {
      const { id, options } = action.payload; // Expect id and options to uniquely identify
      state.items = state.items.filter(
        (cartItem) =>
          !(
            cartItem.id === id &&
            JSON.stringify(cartItem.options) === JSON.stringify(options)
          )
      );
      // Recalculate total and save
      state.totalAmount = calculateTotal(state.items);
      saveCartToLocalStorage(state.items);
    },

    // Action to update the quantity of a specific item
    updateItemQuantity: (state, action) => {
      const { id, quantity, options } = action.payload; // Also need options to find the correct item
      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          cartItem.id === id &&
          JSON.stringify(cartItem.options) === JSON.stringify(options)
      );

      if (existingItemIndex >= 0) {
        const newQuantity = Math.max(1, quantity); // Ensure quantity >= 1
        state.items[existingItemIndex].quantity = newQuantity;
        // Recalculate total and save
        state.totalAmount = calculateTotal(state.items);
        saveCartToLocalStorage(state.items);
      } else {
        console.warn(
          "updateItemQuantity rejected: Item not found.",
          action.payload
        );
      }
    },

    // Action to clear the cart
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      saveCartToLocalStorage(state.items); // Save empty cart
    },
  },
});

// Export actions
export const { setCart, addItem, removeItem, updateItemQuantity, clearCart } =
  cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
