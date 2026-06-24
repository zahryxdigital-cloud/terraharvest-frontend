import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../lib/api";

export interface CartItem {
  id: string; // The frontend historically used 'number' but backend uses string/ObjectId. We will adapt to string representations.
  productId?: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  type: "dried" | "powder" | "slices" | "powders";
}

export interface CartState {
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  isCartOpen: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cartItems: [],
  totalQuantity: 0,
  totalPrice: 0,
  isCartOpen: false,
  loading: false,
  error: null,
};

// --- THUNKS ---

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/cart");
    return data.items || [];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
  }
});

export const addToCartBackend = createAsyncThunk("cart/addToCartBackend", async (item: Omit<CartItem, "quantity"> & { quantity?: number }, { rejectWithValue }) => {
  try {
    // Map 'id' -> 'id' (since controller expects req.body.id = productId)
    const payload = {
      productId: item.id || item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image,
      type: item.type === "slices" ? "dried" : (item.type === "powders" ? "powder" : item.type),
      slug: item.slug
    };
    const { data } = await api.post("/cart", payload);
    return data.items || [];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
  }
});

export const updateCartItemQty = createAsyncThunk("cart/updateCartItemQty", async ({ id, quantity }: { id: string; quantity: number }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/${id}`, { quantity });
    return data.items || [];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update quantity");
  }
});

export const removeFromCartBackend = createAsyncThunk("cart/removeFromCartBackend", async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/${id}`);
    return data.items || [];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to remove item");
  }
});

export const clearCartBackend = createAsyncThunk("cart/clearCartBackend", async (_, { rejectWithValue }) => {
  try {
    await api.delete("/cart");
    return [];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to clear cart");
  }
});

// --- SLICE ---

const calculateTotalsLocal = (items: any[]) => {
  let totalQty = 0;
  let totalPrc = 0;
  items.forEach((item) => {
    totalQty += item.quantity;
    totalPrc += item.quantity * item.price;
  });
  return { totalQuantity: totalQty, totalPrice: totalPrc };
};

// Map backend cart shape items back to frontend shape
const parseItems = (items: any[]): CartItem[] => {
  return items.map((item: any) => ({
    id: item.productId,
    productId: item.productId,
    name: item.name,
    slug: item.slug,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    type: item.type,
  }));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    },
    clearLocalCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    }
  },
  extraReducers: (builder) => {
    // Shared fulfillment handler for all cart thunks
    const handleFulfilled = (state: CartState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = null;
      state.cartItems = parseItems(action.payload);
      const { totalQuantity, totalPrice } = calculateTotalsLocal(state.cartItems);
      state.totalQuantity = totalQuantity;
      state.totalPrice = totalPrice;
    };

    const handlePending = (state: CartState) => {
      state.loading = true;
      state.error = null;
    };

    const handleRejected = (state: CartState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload as string;
    };

    // fetchCart
    builder.addCase(fetchCart.pending, handlePending);
    builder.addCase(fetchCart.fulfilled, handleFulfilled);
    builder.addCase(fetchCart.rejected, handleRejected);

    // addToCartBackend
    builder.addCase(addToCartBackend.pending, handlePending);
    builder.addCase(addToCartBackend.fulfilled, handleFulfilled);
    builder.addCase(addToCartBackend.rejected, handleRejected);

    // updateCartItemQty
    builder.addCase(updateCartItemQty.pending, handlePending);
    builder.addCase(updateCartItemQty.fulfilled, handleFulfilled);
    builder.addCase(updateCartItemQty.rejected, handleRejected);

    // removeFromCartBackend
    builder.addCase(removeFromCartBackend.pending, handlePending);
    builder.addCase(removeFromCartBackend.fulfilled, handleFulfilled);
    builder.addCase(removeFromCartBackend.rejected, handleRejected);

    // clearCartBackend
    builder.addCase(clearCartBackend.pending, handlePending);
    builder.addCase(clearCartBackend.fulfilled, handleFulfilled);
    builder.addCase(clearCartBackend.rejected, handleRejected);
  },
});

export const { toggleCart, setCartOpen, clearLocalCart } = cartSlice.actions;

export default cartSlice.reducer;
