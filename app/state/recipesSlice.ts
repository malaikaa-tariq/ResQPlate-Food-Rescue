import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

type Recipe = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  match: number;
  time: string;
  level: string;
  color: string;
  ingredients: string[];
};

type RecipesState = {
  items: Recipe[];
  status: "idle" | "loading" | "success" | "error";
};

const demo: Recipe[] = [
  {
    id: "1",
    title: "Green rescue shakshuka",
    description:
      "Wilted greens and ripe tomatoes become a bright, comforting one-pan meal.",
    emoji: "🍳",
    match: 92,
    time: "25 min",
    level: "Easy",
    color: "shakshuka",
    ingredients: ["Spinach", "Tomatoes", "Eggs"],
  },
  {
    id: "2",
    title: "Crispy yoghurt toast",
    description:
      "A quick savoury toast with herbed yoghurt and roasted tomatoes.",
    emoji: "🥪",
    match: 84,
    time: "15 min",
    level: "Easy",
    color: "toast",
    ingredients: ["Bread", "Yoghurt", "Tomatoes"],
  },
  {
    id: "3",
    title: "Zero-waste green soup",
    description:
      "A flexible soup for stems, greens, herbs, and tomorrow’s lunch.",
    emoji: "🥣",
    match: 76,
    time: "35 min",
    level: "Simple",
    color: "soup",
    ingredients: ["Spinach", "Herbs", "Bread"],
  },
];

const initialState: RecipesState = {
  items: demo,
  status: "idle",
};

export const fetchRecipes = createAsyncThunk<Recipe[], string>(
  "recipes/fetchRecipes",
  async (ingredients) => {
    void ingredients;

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 750);
    });

    return demo;
  }
);

const slice = createSlice({
  name: "recipes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.status = "success";
        state.items = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state) => {
        state.status = "error";
      });
  },
});

export default slice.reducer;