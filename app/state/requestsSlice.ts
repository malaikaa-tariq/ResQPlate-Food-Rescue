import {
  createSlice,
  nanoid,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type RequestStatus = "Requested" | "Confirmed" | "Completed";

type PickupRequest = {
  id: string;
  title: string;
  location: string;
  time: string;
  person: string;
  initial: string;
  kind: string;
  status: RequestStatus;
};

type RequestsState = {
  items: PickupRequest[];
};

const initialState: RequestsState = {
  items: [
    {
      id: "r1",
      title: "Fresh bakery bundle",
      location: "Clifton Block 5",
      time: "Today, 7:15 PM",
      person: "Community member",
      initial: "CM",
      kind: "FOOD PICKUP",
      status: "Requested",
    },
    {
      id: "r2",
      title: "12 vegetable meal boxes",
      location: "DHA Phase 6",
      time: "Today, 8:00 PM",
      person: "Sara Foundation",
      initial: "SF",
      kind: "NGO COLLECTION",
      status: "Confirmed",
    },
    {
      id: "r3",
      title: "Fruit crate rescue",
      location: "PECHS",
      time: "Yesterday, 6:40 PM",
      person: "Local neighbour",
      initial: "LN",
      kind: "NEIGHBOUR SHARE",
      status: "Completed",
    },
  ],
};

const statusOrder: RequestStatus[] = [
  "Requested",
  "Confirmed",
  "Completed",
];

const slice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    updateRequest: (state, action: PayloadAction<string>) => {
      const request = state.items.find(
        (item) => item.id === action.payload
      );

      if (request) {
        const currentIndex = statusOrder.indexOf(request.status);
        const nextIndex = Math.min(currentIndex + 1, statusOrder.length - 1);

        request.status = statusOrder[nextIndex] ?? request.status;
      }
    },

    createRequest: (state) => {
      state.items.push({
        id: nanoid(),
        title: "Surplus grocery parcel",
        location: "Saddar",
        time: "Tomorrow, 5:30 PM",
        person: "Community Pantry",
        initial: "CP",
        kind: "COMMUNITY PICKUP",
        status: "Requested",
      });
    },
  },
});

export const { updateRequest, createRequest } = slice.actions;

export default slice.reducer;