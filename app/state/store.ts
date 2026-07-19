import {configureStore} from "@reduxjs/toolkit";
import inventory from "./inventorySlice";import donations from "./donationsSlice";import requests from "./requestsSlice";import recipes from "./recipesSlice";
export const store=configureStore({reducer:{inventory,donations,requests,recipes}});export type RootState=ReturnType<typeof store.getState>;export type AppDispatch=typeof store.dispatch;
