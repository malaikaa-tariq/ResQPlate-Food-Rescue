import {
  createAsyncThunk,
  createSlice,
  nanoid,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Food = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  days: number;
  emoji: string;
  color: string;
};

type Product = {
  code?: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
};

type InventoryState = {
  items: Food[];
  searchResults: Product[];
  status: "idle" | "loading" | "success" | "error";
};

export const searchProducts = createAsyncThunk<Product[], string>(
  "inventory/searchProducts",
  async (query) => {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=6`
    );

    if (!response.ok) {
      throw new Error("Product search unavailable");
    }

    const data = (await response.json()) as {
      products?: Product[];
    };

    return data.products ?? [];
  }
);

const initialState: InventoryState = {
  items: [
    {
      id: "1",
      name: "Fresh spinach",
      quantity: 1,
      unit: "bunch",
      category: "Vegetables",
      days: 0,
      emoji: "🥬",
      color: "green",
    },
    {
      id: "2",
      name: "Greek yoghurt",
      quantity: 2,
      unit: "cups",
      category: "Dairy",
      days: 1,
      emoji: "🥛",
      color: "blue",
    },
    {
      id: "3",
      name: "Ripe tomatoes",
      quantity: 4,
      unit: "pieces",
      category: "Vegetables",
      days: 3,
      emoji: "🍅",
      color: "red",
    },
    {
      id: "4",
      name: "Wholegrain bread",
      quantity: 1,
      unit: "loaf",
      category: "Bakery",
      days: 6,
      emoji: "🍞",
      color: "orange",
    },
  ],
  searchResults: [],
  status: "idle",
};

const slice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    addInventory: (
      state,
      action: PayloadAction<{ name: string; days: number }>
    ) => {
      state.items.unshift({
        id: nanoid(),
        name: action.payload.name,
        days: action.payload.days,
        quantity: 1,
        unit: "item",
        category: "Other",
        emoji: "🥕",
        color: "orange",
      });
    },

    removeInventory: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.status = "success";
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state) => {
        state.status = "error";
      });
  },
});

export const { addInventory, removeInventory } = slice.actions;

export default slice.reducer;