# ResQPlate — Food Rescue

ResQPlate is a responsive React application that demonstrates two complementary global state-management approaches: Context API for stable app-wide preferences, and Redux Toolkit for feature-rich domain data.

## Mentor acceptance criteria

- Context API: user account, donor/receiver role, location preference, theme and accessibility-ready preferences in `app/state/AppContext.tsx`.
- Redux Toolkit store: configured in `app/state/store.ts`.
- Four slices: `inventorySlice`, `donationsSlice`, `requestsSlice`, and `recipesSlice`.
- Async thunks: Open Food Facts product search, nearby donation loading, and recipe suggestions.
- Complete responsive interface with pantry tracking, donation discovery, pickup coordination, recipes, theme switching, and an Architecture Lab.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

## Production checks

```bash
npm run lint
npm run build
```

## Responsible limitation

The mentor version uses local demonstration data. Real food-safety verification, deliveries, partner onboarding, and live location tracking require a secure backend and verified organizations.
