# ResQPlate — Food Rescue Website

ResQPlate is a responsive React application that demonstrates two complementary global state-management approaches: Context API for stable app-wide preferences and Redux Toolkit for feature-rich domain data.

- Context API: Manages the user account, donor/receiver role, location preference, theme, and accessibility-ready preferences in `app/state/AppContext.tsx`.
- Redux Toolkit store: Configured in `app/state/store.ts`.
- Four Redux slices: `inventorySlice`, `donationsSlice`, `requestsSlice`, and `recipesSlice`.
- Async thunks: Used for Open Food Facts product searches, nearby donation loading, and recipe suggestions.
- Responsive interface: Includes pantry tracking, donation discovery, pickup coordination, recipes, theme switching, and an Architecture Lab.

## Run Locally

Install the dependencies:

```bash
npm install