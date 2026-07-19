import {
  createAsyncThunk,
  createSlice,
  nanoid,
  PayloadAction,
} from "@reduxjs/toolkit";

type Donation = {
  id: string;
  title: string;
  place: string;
  distance: string;
  time: string;
  type: string;
  emoji: string;
  photo: string;
  donor: string;
  initial: string;
  available: boolean;
};

type DonationsState = {
  items: Donation[];
  status: "idle" | "loading" | "success" | "failed";
};

const demo: Donation[] = [
  {
    id: "d1",
    title: "Fresh bakery bundle",
    place: "Clifton Bakehouse",
    distance: "1.2 km",
    time: "Collect by 7:30 PM",
    type: "BAKERY",
    emoji: "🥐",
    photo: "bakery",
    donor: "Ayesha K.",
    initial: "AK",
    available: true,
  },
  {
    id: "d2",
    title: "Vegetable lunch boxes",
    place: "Green Table Café",
    distance: "2.4 km",
    time: "Collect by 8:00 PM",
    type: "READY MEAL",
    emoji: "🍱",
    photo: "lunch",
    donor: "Green Table",
    initial: "GT",
    available: true,
  },
  {
    id: "d3",
    title: "Seasonal fruit crate",
    place: "Neighbourhood share",
    distance: "3.1 km",
    time: "Collect tomorrow",
    type: "PRODUCE",
    emoji: "🍊",
    photo: "fruit",
    donor: "Hamza R.",
    initial: "HR",
    available: true,
  },
];

const initialState: DonationsState = {
  items: demo,
  status: "idle",
};

export const loadNearbyDonations = createAsyncThunk<
  Donation[],
  void
>("donations/nearby", async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 650));
  return demo;
});

const slice = createSlice({
  name: "donations",
  initialState,
  reducers: {
    claimDonation: (state, action: PayloadAction<string>) => {
      const donation = state.items.find(
        (item) => item.id === action.payload
      );

      if (donation) {
        donation.available = false;
      }
    },

    postDonation: (state) => {
      state.items.unshift({
        id: nanoid(),
        title: "End-of-day bakery box",
        place: "New community donation",
        distance: "0 km",
        time: "Collect by 9:00 PM",
        type: "BAKERY",
        emoji: "🥖",
        photo: "bakery",
        donor: "Community donor",
        initial: "CD",
        available: true,
      });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadNearbyDonations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadNearbyDonations.fulfilled, (state, action) => {
        state.status = "success";
        state.items = action.payload;
      })
      .addCase(loadNearbyDonations.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { claimDonation, postDonation } = slice.actions;

export default slice.reducer;