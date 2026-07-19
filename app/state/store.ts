import { configureStore } from "@reduxjs/toolkit";

import donations from "./donationsSlice";
import inventory from "./inventorySlice";
import recipes from "./recipesSlice";
import requests from "./requestsSlice";

export const store = configureStore({
  reducer: {
    inventory,
    donations,
    requests,
    recipes,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;