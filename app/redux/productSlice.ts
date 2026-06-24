import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../lib/api";
import { products as fallbackProducts } from "../data/products";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  isFeatured: boolean;
  createdAt: string;
  rating: number;
  numReviews: number;
  reviews?: Array<{
    _id: string;
    user: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

const mapFallbackToProduct = (fp: any): Product => ({
  _id: fp.id.toString(),
  name: fp.name,
  slug: fp.slug,
  description: fp.description,
  type: fp.category === "slices" ? "dried" : "powder",
  price: fp.price,
  images: [fp.image || "/images/placeholder.png"],
  stock: fp.inStock ? 100 : 0,
  category: "all",
  isFeatured: fp.isBestseller || false,
  createdAt: new Date().toISOString(),
  rating: fp.rating,
  numReviews: fp.reviews
});

interface ProductState {
  items: Product[];
  currentProduct: Product | null;
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  currentProduct: null,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
};

// Fetch multiple products (with optional queries: ?type=x&category=y&featured=true)
export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (query: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/products", { params: query });
      return data;
    } catch (error: any) {
      console.warn("Backend failed, using fallback products.");
      let filtered = fallbackProducts.map(mapFallbackToProduct);
      
      if (query.keyword) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query.keyword.toLowerCase()));
      }
      if (query.type) {
        filtered = filtered.filter(p => p.type === query.type);
      }
      if (query.featured) {
        filtered = filtered.filter(p => p.isFeatured);
      }
      if (query.limit) {
        filtered = filtered.slice(0, query.limit);
      }
      
      return {
        success: true,
        data: filtered,
        total: filtered.length,
        page: 1,
        pages: 1
      };
    }
  }
);

// Fetch a single product by slug
export const fetchProductBySlug = createAsyncThunk(
  "product/fetchProductBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${slug}`);
      return data.data; // Assuming backend returns { success: true, data: product }
    } catch (error: any) {
      console.warn("Backend failed, using fallback product for slug:", slug);
      const fp = fallbackProducts.find(p => p.slug === slug);
      if (fp) {
        return mapFallbackToProduct(fp);
      }
      return rejectWithValue(error.response?.data?.message || "Product not found");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Product
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
